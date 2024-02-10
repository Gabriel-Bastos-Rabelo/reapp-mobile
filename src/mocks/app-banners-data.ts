export interface IBanner {
  id: number;
  title: string;
  image?: string;
}

export const banners: IBanner[] = [
  {
    id: 0,
    title: 'campanha1',
    image: 'https://placehold.co/600x400',
  },
  {
    id: 1,
    title: 'campanha2',
    image: 'https://placehold.co/600x400',
  },
  {
    id: 2,
    title: 'campanha3',
    image: 'https://placehold.co/600x400',
  },
];
