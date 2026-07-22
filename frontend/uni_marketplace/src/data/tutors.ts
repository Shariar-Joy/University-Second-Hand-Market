export interface Tutor {
  id: string
  name: string
  university: string
  subjects: string[]
  pricePerClass: number
  rating: number
  reviewCount: number
}

export const tutors: Tutor[] = [
  {
    id: 't1',
    name: 'Ashraful Kabir',
    university: 'BUET',
    subjects: ['Calculus I & II', 'Linear Algebra'],
    pricePerClass: 500,
    rating: 4.8,
    reviewCount: 32,
  },
  {
    id: 't2',
    name: 'Mehnaz Tabassum',
    university: 'North South University',
    subjects: ['Data Structures & Algorithms', 'Database Systems'],
    pricePerClass: 700,
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: 't3',
    name: 'Fahim Rahman',
    university: 'University of Dhaka',
    subjects: ['Physics I (Mechanics)', 'Physics II (Electromagnetism)'],
    pricePerClass: 450,
    rating: 4.6,
    reviewCount: 21,
  },
  {
    id: 't4',
    name: 'Sabrina Yasmin',
    university: 'BRAC University',
    subjects: ['Microeconomics', 'Macroeconomics'],
    pricePerClass: 550,
    rating: 4.7,
    reviewCount: 18,
  },
  {
    id: 't5',
    name: 'Tousif Anam',
    university: 'Ahsanullah University of Science and Technology',
    subjects: ['Digital Logic Design', 'Electrical Circuits'],
    pricePerClass: 600,
    rating: 4.5,
    reviewCount: 14,
  },
  {
    id: 't6',
    name: 'Nabila Ferdous',
    university: 'Independent University, Bangladesh',
    subjects: ['English Composition', 'Bangla Literature'],
    pricePerClass: 400,
    rating: 4.9,
    reviewCount: 39,
  },
  {
    id: 't7',
    name: 'Ovi Talukder',
    university: 'Jahangirnagar University',
    subjects: ['Organic Chemistry', 'Inorganic Chemistry'],
    pricePerClass: 500,
    rating: 4.4,
    reviewCount: 12,
  },
  {
    id: 't8',
    name: 'Rezwana Haque',
    university: 'University of Chittagong',
    subjects: ['Object-Oriented Programming', 'Software Engineering'],
    pricePerClass: 650,
    rating: 4.8,
    reviewCount: 26,
  },
]
