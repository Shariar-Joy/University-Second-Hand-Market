import booksImg from '../assets/products/books.svg'
import electronicsImg from '../assets/products/electronics.svg'
import furnitureImg from '../assets/products/furniture.svg'
import clothingImg from '../assets/products/clothing.svg'
import bicyclesImg from '../assets/products/bicycles_2.jpg'
import sportsImg from '../assets/products/sports.svg'
import stationeryImg from '../assets/products/stationery.svg'
import instrumentsImg from '../assets/products/instruments.svg'
import otherImg from '../assets/products/other.svg'

import calculusTextbookImg from '../assets/products/calculus-textbook.jpg'
import laptopImg from '../assets/products/laptop.jpg'
import casioCalculatorImg from '../assets/products/casio-calculator.jpg'
import badmintonSetImg from '../assets/products/badminton-set.jpg'
import guitarImg from '../assets/products/guitar.jpeg'
import winterHoodieImg from '../assets/products/winter-hoodie.jpg'
import dsaTextbookImg from '../assets/products/dsa-textbook.jpg'
import beanBagSofaImg from '../assets/products/bean-bag-sofa.jpg'

export type ProductCondition = 'New' | 'Like New' | 'Good' | 'Fair'

export type ProductCategory =
  | 'Books'
  | 'Electronics'
  | 'Furniture'
  | 'Clothing'
  | 'Bicycles'
  | 'Sports'
  | 'Stationery'
  | 'Instruments'
  | 'Other'

const categoryImages: Record<ProductCategory, string> = {
  Books: booksImg,
  Electronics: electronicsImg,
  Furniture: furnitureImg,
  Clothing: clothingImg,
  Bicycles: bicyclesImg,
  Sports: sportsImg,
  Stationery: stationeryImg,
  Instruments: instrumentsImg,
  Other: otherImg,
}

// Real photos for specific products (keyed by the backend's stable `slug`), falling back to a
// generic category illustration for products without one.
const productImages: Record<string, string> = {
  p1: calculusTextbookImg,
  p2: laptopImg,
  p4: casioCalculatorImg,
  p6: badmintonSetImg,
  p7: guitarImg,
  p8: beanBagSofaImg,
  p9: winterHoodieImg,
  p10: dsaTextbookImg,
}

export function getCategoryImage(category: string): string {
  return categoryImages[category as ProductCategory] ?? otherImg
}

export function getProductImage(product: { slug: string; category: string }): string {
  return productImages[product.slug] ?? getCategoryImage(product.category)
}
