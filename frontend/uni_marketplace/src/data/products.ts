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

export interface Product {
  id: string
  name: string
  category: ProductCategory
  condition: ProductCondition
  price: number
  seller: string
  university: string
  image?: string
}

export const categoryImages: Record<ProductCategory, string> = {
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

export const categoryIcons: Record<ProductCategory, string> = {
  Books: '📚',
  Electronics: '💻',
  Furniture: '🪑',
  Clothing: '👕',
  Bicycles: '🚲',
  Sports: '⚽',
  Stationery: '✏️',
  Instruments: '🎸',
  Other: '📦',
}

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Calculus: Early Transcendentals (10th Ed)',
    category: 'Books',
    condition: 'Good',
    price: 650,
    seller: 'Rafiul Islam',
    university: 'North South University',
    image: calculusTextbookImg,
  },
  {
    id: 'p2',
    name: 'HP Pavilion Laptop (i5, 8GB RAM)',
    category: 'Electronics',
    condition: 'Like New',
    price: 42000,
    seller: 'Nusrat Jahan',
    university: 'BRAC University',
    image: laptopImg,
  },
  {
    id: 'p3',
    name: 'Study Table with Chair',
    category: 'Furniture',
    condition: 'Good',
    price: 3200,
    seller: 'Tanvir Ahmed',
    university: 'University of Dhaka',
  },
  {
    id: 'p4',
    name: 'Casio fx-991EX Scientific Calculator',
    category: 'Stationery',
    condition: 'New',
    price: 1450,
    seller: 'Farhana Akter',
    university: 'BUET',
    image: casioCalculatorImg,
  },
  {
    id: 'p5',
    name: 'Duranta Frontier Bicycle',
    category: 'Bicycles',
    condition: 'Fair',
    price: 8500,
    seller: 'Shafiul Karim',
    university: 'Ahsanullah University of Science and Technology',
  },
  {
    id: 'p6',
    name: 'Badminton Racket Set (2 rackets + shuttles)',
    category: 'Sports',
    condition: 'Good',
    price: 900,
    seller: 'Mahin Chowdhury',
    university: 'Independent University, Bangladesh',
    image: badmintonSetImg,
  },
  {
    id: 'p7',
    name: 'Yamaha F310 Acoustic Guitar',
    category: 'Instruments',
    condition: 'Like New',
    price: 9500,
    seller: 'Adiba Rahman',
    university: 'Jahangirnagar University',
    image: guitarImg,
  },
  {
    id: 'p8',
    name: 'Bean bag sofa',
    category: 'Furniture',
    condition: 'Fair',
    price: 2200,
    seller: 'Imran Hossain',
    university: 'University of Chittagong',
    image: beanBagSofaImg,
  },
  {
    id: 'p9',
    name: 'Winter Hoodie — Varsity Fest Edition',
    category: 'Clothing',
    condition: 'New',
    price: 850,
    seller: 'Sadia Islam',
    university: 'North South University',
    image: winterHoodieImg,
  },
  {
    id: 'p10',
    name: 'Data Structures & Algorithms in C++ (Textbook)',
    category: 'Books',
    condition: 'Good',
    price: 550,
    seller: 'Rakibul Hasan',
    university: 'BRAC University',
    image: dsaTextbookImg,
  },
]
