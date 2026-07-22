import { useMemo, useState } from 'react'
import SearchBar from '../../components/common/SearchBar'
import ProductCard from '../../components/product/ProductCard'
import TutorCard from '../../components/tutor/TutorCard'
import { useAuth } from '../../context/AuthContext'
import { products } from '../../data/products'
import { tutors } from '../../data/tutors'
import { APP_NAME, APP_TAGLINE } from '../../constants'
import styles from './Home.module.css'

function Home() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery),
    )
  }, [normalizedQuery])

  const filteredTutors = useMemo(() => {
    if (!normalizedQuery) return tutors
    return tutors.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(normalizedQuery) ||
        tutor.subjects.some((subject) => subject.toLowerCase().includes(normalizedQuery)),
    )
  }, [normalizedQuery])

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

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Products for Sale</h2>
          <span className={styles.count}>
            {filteredProducts.length} listing{filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>
        {filteredProducts.length > 0 ? (
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
          <span className={styles.count}>
            {filteredTutors.length} tutor{filteredTutors.length === 1 ? '' : 's'}
          </span>
        </div>
        {filteredTutors.length > 0 ? (
          <div className={styles.tutorGrid}>
            {filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No tutors match your search.</p>
        )}
      </section>
    </div>
  )
}

export default Home
