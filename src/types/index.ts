export interface BakingClass {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  capacity: number;
  enrolled: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  items: string[];
  image: string;
  instructor: string;
  location: string;
}

export interface Registration {
  id?: string;
  classId: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
}