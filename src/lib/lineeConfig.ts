export interface LineConfigItem {
  slug: string;
  title: string;
  heroImage: string;
  cardImage: string;
  description?: string;
  categoryId: number | string;
  bgColor: string;
  heroTitle: string;
  subtitle: string;
  productsImage: string;
}

export const lineeConfig: Record<string, LineConfigItem> = {
  lavanda: {
    slug: 'lavanda',
    title: 'Lavanda',
    heroTitle: 'Lavanda',
    heroImage: '/images/pages/lavanda-baner.jpg',
    cardImage: '/images/home/lavanda.jpg',
    description:
      'Nel 1994, in provincia di lodi, nasce il nostro saponificio con una missione chiara: creare saponi di alta qualità utilizzando ingredienti selezionati emetodi tradizionali.Siamo diventati un punto di riferimento nel panoramanazionale della cosmesi naturale, rifornendo punti vendita in tutta italia.Il nostro impegno per lʼartigianato e la sostenibilità ci guida nella scelta dimaterie prime eccellenti, garantendo prodotti efficaci rispettando lʼambiente.Oggi, continuiamo a scrivere la nostra storia con passione, portando ilprofumo e la purezza dei nostri saponia in ogni angolo del paese.Benvenuti nel mondo delta green, dove tradizione e innovazione si incontrano.',
    categoryId: 'lavanda',
    productsImage: '/images/pages/lavanda-products.jpg',
    bgColor: '#F5EFFF',
    subtitle: 'La purezza della natura, nella tua casa',
  },
  'brezza-marina': {
    slug: 'brezza-marina',
    title: 'Brezza Marina',
    heroTitle: 'Brezza Marina',
    heroImage: '/images/pages/brezza-marina-baner.jpg',
    cardImage: '/images/home/brezza-marina.jpg',
    description:
      'Nel 1994, in provincia di lodi, nasce il nostro saponificio con una missione chiara: creare saponi di alta qualità utilizzando ingredienti selezionati emetodi tradizionali.Siamo diventati un punto di riferimento nel panoramanazionale della cosmesi naturale, rifornendo punti vendita in tutta italia.Il nostro impegno per lʼartigianato e la sostenibilità ci guida nella scelta dimaterie prime eccellenti, garantendo prodotti efficaci rispettando lʼambiente.Oggi, continuiamo a scrivere la nostra storia con passione, portando ilprofumo e la purezza dei nostri saponia in ogni angolo del paese.Benvenuti nel mondo delta green, dove tradizione e innovazione si incontrano.',
    categoryId: 'brezza',
    productsImage: '/images/pages/lavanda-products.jpg',
    bgColor: '#E2F5F4',
    subtitle: 'La purezza della natura, nella tua casa',
  },
  'agrumi-di-sicilia': {
    slug: 'agrumi-di-sicilia',
    title: 'Agrumi di Sicilia',
    heroTitle: 'Agrumi di Sicilia',
    heroImage: '/images/pages/agrumi-di-sicilia-baner.jpg',
    cardImage: '/images/home/agrumi-di-sicilia.jpg',
    description:
      'Nel 1994, in provincia di lodi, nasce il nostro saponificio con una missione chiara: creare saponi di alta qualità utilizzando ingredienti selezionati emetodi tradizionali.Siamo diventati un punto di riferimento nel panoramanazionale della cosmesi naturale, rifornendo punti vendita in tutta italia.Il nostro impegno per lʼartigianato e la sostenibilità ci guida nella scelta dimaterie prime eccellenti, garantendo prodotti efficaci rispettando lʼambiente.Oggi, continuiamo a scrivere la nostra storia con passione, portando ilprofumo e la purezza dei nostri saponia in ogni angolo del paese.Benvenuti nel mondo delta green, dove tradizione e innovazione si incontrano.',
    categoryId: 'agrumi',
    productsImage: '/images/pages/lavanda-products.jpg',
    bgColor: '#FFEDDD',
    subtitle: 'La purezza della natura, nella tua casa',
  },
  'fiore-di-loto': {
    slug: 'fiore-di-loto',
    title: 'Fiore di Loto',
    heroTitle: 'Fiore di Loto',
    heroImage: '/images/pages/fiore-di-loto-baner.jpg',
    cardImage: '/images/home/fiore-di-loto.jpg',
    description:
      'Nel 1994, in provincia di lodi, nasce il nostro saponificio con una missione chiara: creare saponi di alta qualità utilizzando ingredienti selezionati emetodi tradizionali.Siamo diventati un punto di riferimento nel panoramanazionale della cosmesi naturale, rifornendo punti vendita in tutta italia.Il nostro impegno per lʼartigianato e la sostenibilità ci guida nella scelta dimaterie prime eccellenti, garantendo prodotti efficaci rispettando lʼambiente.Oggi, continuiamo a scrivere la nostra storia con passione, portando ilprofumo e la purezza dei nostri saponia in ogni angolo del paese.Benvenuti nel mondo delta green, dove tradizione e innovazione si incontrano.',
    categoryId: 'fiore',
    productsImage: '/images/pages/lavanda-products.jpg',
    bgColor: '#FFEEF2',
    subtitle: 'La purezza della natura, nella tua casa',
  },
  marsiglia: {
    slug: 'marsiglia',
    title: 'Marsiglia',
    heroTitle: 'Marsiglia',
    heroImage: '/images/pages/marsiglia-baner.jpg',
    cardImage: '/images/home/marsiglia.jpg',
    description:
      'Nel 1994, in provincia di lodi, nasce il nostro saponificio con una missione chiara: creare saponi di alta qualità utilizzando ingredienti selezionati emetodi tradizionali.Siamo diventati un punto di riferimento nel panoramanazionale della cosmesi naturale, rifornendo punti vendita in tutta italia.Il nostro impegno per lʼartigianato e la sostenibilità ci guida nella scelta dimaterie prime eccellenti, garantendo prodotti efficaci rispettando lʼambiente.Oggi, continuiamo a scrivere la nostra storia con passione, portando ilprofumo e la purezza dei nostri saponia in ogni angolo del paese.Benvenuti nel mondo delta green, dove tradizione e innovazione si incontrano.',
    categoryId: 'marsiglia',
    productsImage: '/images/pages/lavanda-products.jpg',
    bgColor: '#FFEDDD',
    subtitle: 'La purezza della natura, nella tua casa',
  },
  neutro: {
    slug: 'neutro',
    title: 'Neutro',
    heroTitle: 'Neutro',
    heroImage: '/images/pages/neutro-baner.jpg',
    cardImage: '/images/home/neutro.jpg',
    description:
      'Nel 1994, in provincia di lodi, nasce il nostro saponificio con una missione chiara: creare saponi di alta qualità utilizzando ingredienti selezionati emetodi tradizionali.Siamo diventati un punto di riferimento nel panoramanazionale della cosmesi naturale, rifornendo punti vendita in tutta italia.Il nostro impegno per lʼartigianato e la sostenibilità ci guida nella scelta dimaterie prime eccellenti, garantendo prodotti efficaci rispettando lʼambiente.Oggi, continuiamo a scrivere la nostra storia con passione, portando ilprofumo e la purezza dei nostri saponia in ogni angolo del paese.Benvenuti nel mondo delta green, dove tradizione e innovazione si incontrano.',
    categoryId: 'neutro',
    productsImage: '/images/pages/lavanda-products.jpg',
    bgColor: '#EEF5E2',
    subtitle: 'La purezza della natura, nella tua casa',
  },
};
