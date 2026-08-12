import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Bike,
  Building2,
  ChevronDown,
  GraduationCap,
  LayoutGrid,
  Laptop,
  Mail,
  Music2,
  Package,
  PenTool,
  Quote,
  Send,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Sofa,
  Trophy,
  Users,
} from 'lucide-react'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import ProductCard from '../../components/product/ProductCard'
import ProductFilters, { EMPTY_PRODUCT_FILTERS, hasActiveProductFilters } from '../../components/product/ProductFilters'
import type { ProductFilterValues } from '../../components/product/ProductFilters'
import TutorCard from '../../components/tutor/TutorCard'
import SectionTitle from '../../components/ui/SectionTitle'
import StatsCard from '../../components/ui/StatsCard'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Drawer from '../../components/ui/Drawer'
import { ProductCardSkeleton, TutorCardSkeleton } from '../../components/ui/LoadingSkeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import * as productService from '../../services/productService'
import * as tutorService from '../../services/tutorService'
import type { Product } from '../../services/productService'
import type { Tutor } from '../../services/tutorService'
import { isValidEmailFormat } from '../../utils/emailValidation'
import { APP_NAME, APP_TAGLINE } from '../../constants'

const PRODUCTS_PER_PAGE = 8

const CATEGORIES = [
  { name: 'Books', icon: BookOpen },
  { name: 'Electronics', icon: Laptop },
  { name: 'Furniture', icon: Sofa },
  { name: 'Clothing', icon: Shirt },
  { name: 'Bicycles', icon: Bike },
  { name: 'Sports', icon: Trophy },
  { name: 'Stationery', icon: PenTool },
  { name: 'Instruments', icon: Music2 },
  { name: 'Other', icon: Package },
]

const TESTIMONIALS = [
  {
    name: 'Anika Rahman',
    university: 'BUET',
    quote:
      'I sold my old calculus textbook within a day and found a great tutor for my Data Structures course — all on one platform.',
  },
  {
    name: 'Tanvir Ahmed',
    university: 'DU',
    quote:
      'Way better than posting in random Facebook groups. Everyone here is a verified student, so it feels safe to meet up and trade.',
  },
  {
    name: 'Farzana Islam',
    university: 'NSU',
    quote: 'Picked up a bike and a bean bag for half the retail price. Campus Exchange is now my first stop every semester.',
  },
]

const FAQS = [
  {
    question: 'Who can use Campus Exchange?',
    answer: 'Anyone with a verified university email can sign up — the marketplace is limited to real students only.',
  },
  {
    question: 'How do I meet a seller safely?',
    answer: 'We recommend arranging a public, on-campus meetup during daytime hours to inspect and exchange items.',
  },
  {
    question: 'Is booking a tutor free?',
    answer: 'Browsing tutor profiles is always free. Tutors set their own per-class rates, shown on each profile.',
  },
  {
    question: 'Can I sell items outside the listed categories?',
    answer: 'Yes — pick the closest matching category or "Other" when you create your listing.',
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-ink">{question}</span>
        <ChevronDown
          className={['h-5 w-5 shrink-0 text-ink-soft transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-4 text-sm text-ink-soft">{answer}</p>
      </motion.div>
    </div>
  )
}

function Home() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filters, setFilters] = useState<ProductFilterValues>(EMPTY_PRODUCT_FILTERS)
  const [debouncedFilters, setDebouncedFilters] = useState<ProductFilterValues>(EMPTY_PRODUCT_FILTERS)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // Unfiltered products, fetched once -- used only for the site-wide stats below, so a search or
  // filter never changes the "X+ Active Listings" counts.
  const [products, setProducts] = useState<Product[]>([])
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // The actual "Products for sale" grid: always backend-driven by search + filters + sort
  // together, kept separate from the state above so it has its own loading/error lifecycle.
  const [listingResults, setListingResults] = useState<Product[]>([])
  const [isListingLoading, setIsListingLoading] = useState(true)
  const [listingError, setListingError] = useState('')
  const isMountedRef = useRef(true)

  const productsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    Promise.all([productService.listProducts(), tutorService.listTutors()])
      .then(([fetchedProducts, fetchedTutors]) => {
        if (!isMounted) return
        setProducts(fetchedProducts)
        setTutors(fetchedTutors)
      })
      .catch(() => {
        if (isMounted) setLoadError('Could not load the marketplace right now. Please try again shortly.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const normalizedQuery = query.trim().toLowerCase()

  // Debounce so fast typing (search text or the min/max price fields) doesn't fire a backend
  // request per keystroke. Category/condition/availability/sort ride the same debounced state --
  // one request per settled change instead of a separate mechanism per control.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim())
      setDebouncedFilters(filters)
    }, 350)
    return () => clearTimeout(handle)
  }, [query, filters])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, debouncedFilters])

  // Guards against a stale (older) response overwriting a newer one that already applied its
  // results -- tracks the last *applied* request rather than the last *issued* one, so two
  // requests firing close together (e.g. React StrictMode's double-invoked effects in dev) don't
  // leave the UI stuck waiting on whichever one happens to finish last.
  const listingRequestIdRef = useRef(0)
  const lastAppliedListingRequestIdRef = useRef(0)

  const runProductListing = useCallback((term: string, filterValues: ProductFilterValues) => {
    const requestId = ++listingRequestIdRef.current
    setIsListingLoading(true)
    setListingError('')
    productService
      .listProducts({
        search: term || undefined,
        category: filterValues.category || undefined,
        condition: filterValues.condition || undefined,
        minPrice: filterValues.minPrice ? Number(filterValues.minPrice) : undefined,
        maxPrice: filterValues.maxPrice ? Number(filterValues.maxPrice) : undefined,
        availability: filterValues.availability || undefined,
        sort: filterValues.sort || undefined,
      })
      .then((results) => {
        if (!isMountedRef.current || requestId < lastAppliedListingRequestIdRef.current) return
        lastAppliedListingRequestIdRef.current = requestId
        setListingResults(results)
      })
      .catch(() => {
        if (!isMountedRef.current || requestId < lastAppliedListingRequestIdRef.current) return
        lastAppliedListingRequestIdRef.current = requestId
        setListingResults([])
        setListingError('Could not load products right now. Please try again.')
      })
      .finally(() => {
        if (isMountedRef.current) setIsListingLoading(false)
      })
  }, [])

  useEffect(() => {
    runProductListing(debouncedQuery, debouncedFilters)
  }, [debouncedQuery, debouncedFilters, runProductListing])

  const isFiltering = debouncedQuery.length > 0 || hasActiveProductFilters(debouncedFilters)
  const displayedProducts = listingResults

  function clearSearchAndFilters() {
    setQuery('')
    setFilters(EMPTY_PRODUCT_FILTERS)
  }

  const filteredTutors = useMemo(() => {
    if (!normalizedQuery) return tutors
    return tutors.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(normalizedQuery) ||
        tutor.subjects.some((subject) => subject.toLowerCase().includes(normalizedQuery)),
    )
  }, [tutors, normalizedQuery])

  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / PRODUCTS_PER_PAGE))
  const paginatedProducts = displayedProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE)

  const stats = useMemo(() => {
    const universityCount = new Set([...products.map((p) => p.university), ...tutors.map((t) => t.university)]).size
    const categoryCount = new Set(products.map((p) => p.category)).size
    return [
      { icon: ShoppingBag, value: `${products.length}+`, label: 'Active Listings' },
      { icon: GraduationCap, value: `${tutors.length}+`, label: 'Peer Tutors' },
      { icon: Building2, value: `${universityCount}+`, label: 'Universities' },
      { icon: LayoutGrid, value: `${categoryCount}+`, label: 'Categories' },
    ]
  }, [products, tutors])

  function handleCategoryClick(category: string) {
    setQuery(category)
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidEmailFormat(newsletterEmail)) {
      showToast('Enter a valid email address to subscribe.', 'error')
      return
    }
    showToast("You're subscribed! We'll send new listings straight to your inbox.", 'success')
    setNewsletterEmail('')
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-linear-to-b from-primary/5 via-white to-white pt-16 pb-20 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="animate-blob absolute -top-10 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl [animation-delay:4s]" />
          <div className="animate-blob absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl [animation-delay:8s]" />
        </div>

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
          >
            The marketplace built for your campus
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl leading-tight font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            {user ? (
              <>
                Welcome back, <span className="text-primary">{user.fullName.split(' ')[0]}</span>
              </>
            ) : (
              <>
                Buy, sell, and learn — <span className="text-primary">without leaving campus</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl text-lg text-ink-soft"
          >
            {APP_TAGLINE || `${APP_NAME} connects verified students to trade textbooks, electronics, and more — and to find trusted peer tutors.`}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-xl"
          >
            <SearchBar value={query} onChange={setQuery} placeholder="Search for textbooks, laptops, tutors…" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {CATEGORIES.slice(0, 6).map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => handleCategoryClick(name)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {name}
              </button>
            ))}
          </motion.div>

          <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <StatsCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Categories" title="Shop by category" align="center" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map(({ name, icon: Icon }, index) => (
            <motion.button
              key={name}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              onClick={() => handleCategoryClick(name)}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white px-4 py-6 text-center shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-ink">{name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <section ref={productsRef} id="products" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Marketplace"
          title="Products for sale"
          subtitle="Fresh listings from students across campus."
          action={
            !isListingLoading && (
              <span className="text-sm font-medium text-ink-soft">
                {displayedProducts.length} listing{displayedProducts.length === 1 ? '' : 's'}
              </span>
            )
          }
        />

        <div className="mt-8 flex items-start gap-8">
          <aside className="hidden w-64 shrink-0 rounded-2xl border border-border bg-white p-5 shadow-card lg:block">
            <ProductFilters values={filters} onChange={setFilters} onClear={() => setFilters(EMPTY_PRODUCT_FILTERS)} />
          </aside>

          <div className="min-w-0 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="mb-5 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {hasActiveProductFilters(filters) && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {Object.values(filters).filter((value) => value !== '').length}
                </span>
              )}
            </Button>

            {listingError ? (
              <EmptyState
                icon={ShoppingBag}
                title="Something went wrong"
                description={listingError}
                action={
                  <Button variant="outline" onClick={() => runProductListing(debouncedQuery, debouncedFilters)}>
                    Try Again
                  </Button>
                }
              />
            ) : isListingLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-10">
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </>
            ) : isFiltering ? (
              <EmptyState
                icon={ShoppingBag}
                title="No products match your search or filters"
                description="Try a different keyword, or adjust your filters."
                action={
                  <Button variant="outline" onClick={clearSearchAndFilters}>
                    Clear Search &amp; Filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="No listings yet"
                description="Check back soon — new listings show up here as students post them."
              />
            )}
          </div>
        </div>
      </section>

      <Drawer isOpen={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} title="Filters">
        <ProductFilters
          values={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_PRODUCT_FILTERS)}
          hideHeading
        />
        <div className="mt-6 flex gap-2">
          {hasActiveProductFilters(filters) && (
            <Button variant="outline" onClick={() => setFilters(EMPTY_PRODUCT_FILTERS)}>
              Clear
            </Button>
          )}
          <Button className="flex-1" onClick={() => setIsFilterDrawerOpen(false)}>
            Show Results
          </Button>
        </div>
      </Drawer>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Peer Tutors"
            title="Learn from top students"
            subtitle="Book affordable, subject-matter tutoring from verified peers."
            action={
              !isLoading && (
                <span className="text-sm font-medium text-ink-soft">
                  {filteredTutors.length} tutor{filteredTutors.length === 1 ? '' : 's'}
                </span>
              )
            }
          />

          {!loadError &&
            (isLoading ? (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <TutorCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredTutors.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No tutors match your search"
                description="Try a different subject or clear your search."
                className="mt-8"
              />
            ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Testimonials" title="Loved by students across campuses" align="center" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-card"
            >
              <Quote className="h-6 w-6 text-primary/40" aria-hidden="true" />
              <p className="flex-1 text-sm text-ink-soft">"{testimonial.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
                <p className="text-xs text-ink-soft">{testimonial.university}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="FAQ" title="Frequently asked questions" align="center" />
          <div className="mt-8 flex flex-col gap-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4 rounded-3xl bg-primary px-6 py-12 text-center text-white sm:px-12"
        >
          <Mail className="h-8 w-8" aria-hidden="true" />
          <h2 className="text-2xl font-bold sm:text-3xl">Never miss a good deal</h2>
          <p className="max-w-md text-white/90">
            Get the newest listings from your campus delivered to your inbox every week.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="you@university.edu"
              aria-label="Email address"
              className="h-12 w-full rounded-xl border-0 bg-white px-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:ring-4 focus:ring-white/30"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-primary transition-colors hover:bg-white/90 active:scale-[0.97]"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  )
}

export default Home
