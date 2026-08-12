import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, GraduationCap, LayoutGrid, Quote, ShoppingBag, SlidersHorizontal, Users } from 'lucide-react'
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
import * as productService from '../../services/productService'
import * as tutorService from '../../services/tutorService'
import type { Product } from '../../services/productService'
import type { Tutor } from '../../services/tutorService'
import { APP_NAME, APP_TAGLINE } from '../../constants'
import { ROUTES } from '../../routes/routePaths'

const PRODUCTS_PER_PAGE = 8

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

function Home() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filters, setFilters] = useState<ProductFilterValues>(EMPTY_PRODUCT_FILTERS)
  const [debouncedFilters, setDebouncedFilters] = useState<ProductFilterValues>(EMPTY_PRODUCT_FILTERS)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)

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

  const loadOverview = useCallback(() => {
    let isMounted = true
    setIsLoading(true)
    setLoadError('')
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

  useEffect(() => {
    const cleanup = loadOverview()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

          <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <StatsCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} index={index} />
            ))}
          </div>
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
            subtitle="Connect with affordable, subject-matter tutoring from verified peers."
            action={
              <div className="flex items-center gap-3">
                {!isLoading && !loadError && (
                  <span className="text-sm font-medium text-ink-soft">
                    {filteredTutors.length} tutor{filteredTutors.length === 1 ? '' : 's'}
                  </span>
                )}
                {user && (
                  <Button to={ROUTES.BECOME_TUTOR} variant="outline" size="sm">
                    <GraduationCap className="h-4 w-4" aria-hidden="true" />
                    Become a Tutor
                  </Button>
                )}
              </div>
            }
          />

          {loadError ? (
            <EmptyState
              icon={Users}
              title="Could not load tutors"
              description={loadError}
              action={
                <Button variant="outline" onClick={loadOverview}>
                  Try Again
                </Button>
              }
              className="mt-8"
            />
          ) : isLoading ? (
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
          )}
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
    </div>
  )
}

export default Home
