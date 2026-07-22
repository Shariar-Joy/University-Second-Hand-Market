import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../../components/common/SearchBar'
import ProductCard from '../../components/product/ProductCard'
import TutorCard from '../../components/tutor/TutorCard'
import { useAuth } from '../../context/AuthContext'
import * as productService from '../../services/productService'
import * as tutorService from '../../services/tutorService'
import type { Product } from '../../services/productService'
import type { Tutor } from '../../services/tutorService'
import { APP_NAME, APP_TAGLINE } from '../../constants'
import styles from './Home.module.css'

function Home() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const [products, setProducts] = useState<Product[]>([])
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

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

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery),
    )
  }, [products, normalizedQuery])

  const filteredTutors = useMemo(() => {
    if (!normalizedQuery) return tutors
    return tutors.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(normalizedQuery) ||
        tutor.subjects.some((subject) => subject.toLowerCase().includes(normalizedQuery)),
    )
  }, [tutors, normalizedQuery])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {user ? `Welcome back, ${user.fullName.split(' ')[0]}!` : `Welcome to ${APP_NAME}`}
        </h1>
        <p className={styles.heroSubtitle}>{APP_TAGLINE}</p>
        <div className={styles.searchWrapper}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search products or tutors…" />
        </div>
      </section>

      {loadError && <p className={styles.empty}>{loadError}</p>}

      {!loadError && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Products for Sale</h2>
              {!isLoading && (
                <span className={styles.count}>
                  {filteredProducts.length} listing{filteredProducts.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            {isLoading ? (
              <p className={styles.empty}>Loading products…</p>
            ) : filteredProducts.length > 0 ? (
              <div className={styles.productGrid}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>No products match your search.</p>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Tutors</h2>
              {!isLoading && (
                <span className={styles.count}>
                  {filteredTutors.length} tutor{filteredTutors.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            {isLoading ? (
              <p className={styles.empty}>Loading tutors…</p>
            ) : filteredTutors.length > 0 ? (
              <div className={styles.tutorGrid}>
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>No tutors match your search.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default Home
