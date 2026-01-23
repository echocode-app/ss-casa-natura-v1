import { Product } from './product.types';

const DEFAULT_IMAGE = '/images/home/product.png';

export const PRODUCTS_MOCK: Product[] = [
  {
    id: 'prod-001',
    sku: 'art.0000001',
    slug: 'detersivo-piatti-limone',
    title: 'Detersivo Piatti Limone',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['detersivi-piatti'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 3.5,
        weightGrams: 1100,
      },
    ],
    weightGrams: 1100,
    price: 5.5,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-002',
    sku: 'art.0000002',
    slug: 'cura-lavastoviglie-marsiglia',
    title: 'C',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['cura-lavastoviglie'],
    lineId: 'marsiglia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 250', volume: 250, unit: 'ml', priceModifier: 0, weightGrams: 275 },
      { id: 'v2', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 2.0, weightGrams: 550 },
    ],
    weightGrams: 300,
    price: 4.5,
    currency: 'EUR',
  },
  {
    id: 'prod-003',
    sku: 'art.0000003',
    slug: 'ammorbidente-lavanda',
    title: 'Ammorbidente Lavanda',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['ammorbidenti'],
    lineId: 'lavanda',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 3.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 1200,
    price: 6.0,
    currency: 'EUR',
  },
  {
    id: 'prod-004',
    sku: 'art.0000004',
    slug: 'detersivo-bucato-fiore-di-loto',
    title: 'Detersivo Bucato Fiore di Loto',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['detersivi-bucato'],
    lineId: 'fiore-di-loto',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 5.0,
        weightGrams: 1100,
      },
    ],
    weightGrams: 1100,
    price: 7.0,
    currency: 'EUR',
  },
  {
    id: 'prod-005',
    sku: 'art.0000005',
    slug: 'sgrassatore-neutro',
    title: 'Sgrassatore Neutro',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['sgrassatori'],
    lineId: 'neutro',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 50', volume: 50, unit: 'ml', priceModifier: 0, weightGrams: 55 },
      { id: 'v2', label: 'ml 200', volume: 200, unit: 'ml', priceModifier: 2.5, weightGrams: 220 },
    ],
    weightGrams: 60,
    price: 3.0,
    currency: 'EUR',
  },
  {
    id: 'prod-006',
    sku: 'art.0000006',
    slug: 'lavapavimenti-brezza-marina',
    title: 'Lavapavimenti Brezza Marina',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['lavapavimenti'],
    lineId: 'brezza-marina',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 4.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 1200,
    price: 8.0,
    currency: 'EUR',
  },
  {
    id: 'prod-007',
    sku: 'art.0000007',
    slug: 'detersivo-piatti-limone-ricarica',
    title: 'Detersivo Piatti Limone Ricarica',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['detersivi-piatti'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 3.0,
        weightGrams: 1100,
      },
    ],
    weightGrams: 1100,
    price: 4.8,
    currency: 'EUR',
  },
  {
    id: 'prod-008',
    sku: 'art.0000008',
    slug: 'cura-lavastoviglie-lavanda',
    title: 'Cura Lavastoviglie Lavanda',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['cura-lavastoviglie'],
    lineId: 'lavanda',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 300', volume: 300, unit: 'ml', priceModifier: 0, weightGrams: 330 },
      { id: 'v2', label: 'ml 600', volume: 600, unit: 'ml', priceModifier: 2.5, weightGrams: 660 },
    ],
    weightGrams: 350,
    price: 5.0,
    currency: 'EUR',
  },
  {
    id: 'prod-009',
    sku: 'art.0000009',
    slug: 'ammorbidente-brezza-marina',
    title: 'Ammorbidente Brezza Marina',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['ammorbidenti'],
    lineId: 'brezza-marina',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 4.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 1200,
    price: 6.5,
    currency: 'EUR',
  },
  {
    id: 'prod-010',
    sku: 'art.0000010',
    slug: 'detersivo-bucato-neutro',
    title: 'Detersivo Bucato Neutro',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['detersivi-bucato'],
    lineId: 'neutro',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 4.0,
        weightGrams: 1100,
      },
    ],
    weightGrams: 1100,
    price: 7.0,
    currency: 'EUR',
  },
  {
    id: 'prod-011',
    sku: 'art.0000011',
    slug: 'sgrassatore-agrumi',
    title: 'Sgrassatore Agrumi',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['sgrassatori'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 100', volume: 100, unit: 'ml', priceModifier: 0, weightGrams: 110 },
      { id: 'v2', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 4.5, weightGrams: 550 },
    ],
    weightGrams: 120,
    price: 5.0,
    currency: 'EUR',
  },
  {
    id: 'prod-012',
    sku: 'art.0000012',
    slug: 'lavapavimenti-lavanda',
    title: 'Lavapavimenti Lavanda',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['lavapavimenti'],
    lineId: 'lavanda',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 3.0,
        weightGrams: 1100,
      },
    ],
    weightGrams: 1100,
    price: 6.0,
    currency: 'EUR',
  },
  {
    id: 'prod-013',
    sku: 'art.0000013',
    slug: 'detersivo-piatti-fiore-di-loto',
    title: 'Detersivo Piatti Fiore di Loto',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['detersivi-piatti'],
    lineId: 'fiore-di-loto',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 250', volume: 250, unit: 'ml', priceModifier: 0, weightGrams: 275 },
      { id: 'v2', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 2.5, weightGrams: 550 },
    ],
    weightGrams: 300,
    price: 4.0,
    currency: 'EUR',
  },
  {
    id: 'prod-014',
    sku: 'art.0000014',
    slug: 'cura-lavastoviglie-neutro',
    title: 'Cura Lavastoviglie Neutro',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['cura-lavastoviglie'],
    lineId: 'neutro',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 250', volume: 250, unit: 'ml', priceModifier: 0, weightGrams: 275 },
      { id: 'v2', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 2.0, weightGrams: 550 },
    ],
    weightGrams: 300,
    price: 3.5,
    currency: 'EUR',
  },
  {
    id: 'prod-015',
    sku: 'art.0000015',
    slug: 'ammorbidente-fiore-di-loto',
    title: 'Ammorbidente Fiore di Loto',
    description: `Detersivo piatti ricaricabile
Puoi sciogliere rapidamente e facilmente il nostro Detersivo Piatti in Polvere everdrop per ottenere un detersivo liquido. Senza plastica monouso, ma con ingredienti naturali, rende i tuoi piatti e bicchieri splendenti e rimuove anche lo sporco più ostinato e incrostato. Ora con un fresco profumo di limone e gelsomino!
・Pulizia efficace & forte contro il grasso
・100% vegano
・Formula senza microplastiche
・Tensioattivi a base vegetale
・Dermatologicamente testato
・Con inulina dalla radice di cicoria – supporta la barriera cutanea naturale e idrata la pelle
・Con ingredienti facilmente biodegradabili
・Dosaggio semplice grazie al nostro erogatore a pompa
・Confezione facilmente riciclabile nella carta`,
    categoryIds: ['ammorbidenti'],
    lineId: 'fiore-di-loto',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 3.5,
        weightGrams: 2200,
      },
    ],
    weightGrams: 1200,
    price: 6.5,
    currency: 'EUR',
  },
  {
    id: 'prod-016',
    sku: 'art.0000016',
    slug: 'detersivo-piatti-arancia',
    title: 'Detersivo Piatti Arancia',
    description: '',
    categoryIds: ['detersivi-piatti'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 4.5,
        weightGrams: 1100,
      },
    ],
    weightGrams: 1200,
    price: 15,
    currency: 'EUR',
  },
  {
    id: 'prod-017',
    sku: 'art.0000017',
    slug: 'cura-lavastoviglie-limone',
    title: 'Cura Lavastoviglie Limone',
    description: '',
    categoryIds: ['cura-lavastoviglie'],
    lineId: 'fiore-di-loto',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 250', volume: 250, unit: 'ml', priceModifier: 0, weightGrams: 275 },
      { id: 'v2', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 3.0, weightGrams: 550 },
    ],
    weightGrams: 250,
    price: 10,
    currency: 'EUR',
  },
  {
    id: 'prod-018',
    sku: 'art.0000018',
    slug: 'ammorbidente-marsiglia',
    title: 'Ammorbidente Marsiglia',
    description: '',
    categoryIds: ['ammorbidenti'],
    lineId: 'marsiglia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 5.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 2000,
    price: 25,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-019',
    sku: 'art.0000019',
    slug: 'detersivo-bucato-brezza',
    title: 'Detersivo Bucato Brezza Marina',
    description: '',
    categoryIds: ['detersivi-bucato'],
    lineId: 'brezza-marina',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1500',
        volume: 1500,
        unit: 'ml',
        priceModifier: 6.0,
        weightGrams: 1650,
      },
    ],
    weightGrams: 800,
    price: 18,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-020',
    sku: 'art.0000020',
    slug: 'sgrassatore-limone',
    title: 'Sgrassatore Limone',
    description: '',
    categoryIds: ['sgrassatori'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 100', volume: 100, unit: 'ml', priceModifier: 0, weightGrams: 110 },
      { id: 'v2', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 7.5, weightGrams: 550 },
    ],
    weightGrams: 50,
    price: 12,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-021',
    sku: 'art.0000021',
    slug: 'lavapavimenti-neutro',
    title: 'Lavapavimenti Neutro',
    description: '',
    categoryIds: ['lavapavimenti'],
    lineId: 'neutro',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 10.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 1000,
    price: 22,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-022',
    sku: 'art.0000022',
    slug: 'detersivo-piatti-lavanda',
    title: 'Detersivo Piatti Lavanda',
    description: '',
    categoryIds: ['detersivi-piatti'],
    lineId: 'lavanda',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 200', volume: 200, unit: 'ml', priceModifier: 0, weightGrams: 220 },
      { id: 'v2', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 5.0, weightGrams: 550 },
    ],
    weightGrams: 220,
    price: 10,
    currency: 'EUR',
  },
  {
    id: 'prod-023',
    sku: 'art.0000023',
    slug: 'cura-lavastoviglie-agrumi',
    title: 'Cura Lavastoviglie Agrumi',
    description: '',
    categoryIds: ['cura-lavastoviglie'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 8.0,
        weightGrams: 1100,
      },
    ],
    weightGrams: 600,
    price: 30,
    currency: 'EUR',
  },
  {
    id: 'prod-024',
    sku: 'art.0000024',
    slug: 'ammorbidente-fiore-di-loto',
    title: 'Ammorbidente Fiore di Loto',
    description: '',
    categoryIds: ['ammorbidenti'],
    lineId: 'fiore-di-loto',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 10.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 2000,
    price: 4500,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-025',
    sku: 'art.0000025',
    slug: 'detersivo-bucato-limone',
    title: 'Detersivo Bucato Limone',
    description: '',
    categoryIds: ['detersivi-bucato'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 12.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 1800,
    price: 60,
    currency: 'EUR',
  },
  {
    id: 'prod-026',
    sku: 'art.0000026',
    slug: 'sgrassatore-agrumi-extra',
    title: 'Sgrassatore Agrumi Extra',
    description: '',
    categoryIds: ['sgrassatori'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 50', volume: 50, unit: 'ml', priceModifier: 0, weightGrams: 55 },
      { id: 'v2', label: 'ml 200', volume: 200, unit: 'ml', priceModifier: 5.0, weightGrams: 220 },
    ],
    weightGrams: 60,
    price: 10,
    currency: 'EUR',
  },
  {
    id: 'prod-027',
    sku: 'art.0000027',
    slug: 'lavapavimenti-limone',
    title: 'Lavapavimenti Limone',
    description: '',
    categoryIds: ['lavapavimenti'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 1000', volume: 1000, unit: 'ml', priceModifier: 0, weightGrams: 1100 },
      {
        id: 'v2',
        label: 'ml 5000',
        volume: 5000,
        unit: 'ml',
        priceModifier: 30.0,
        weightGrams: 5500,
      },
    ],
    weightGrams: 2000,
    price: 100,
    currency: 'EUR',
  },
  {
    id: 'prod-028',
    sku: 'art.0000028',
    slug: 'detersivo-bucato-professionale',
    title: 'Detersivo Bucato Professionale',
    description: '',
    categoryIds: ['detersivi-bucato'],
    lineId: 'neutro',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      {
        id: 'v1',
        label: 'ml 10000',
        volume: 10000,
        unit: 'ml',
        priceModifier: 0,
        weightGrams: 11000,
      },
      {
        id: 'v2',
        label: 'ml 20000',
        volume: 20000,
        unit: 'ml',
        priceModifier: 5000,
        weightGrams: 22000,
      },
    ],
    weightGrams: 2000,
    price: 1000,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-029',
    sku: 'art.0000029',
    slug: 'ammorbidente-limone-extra',
    title: 'Ammorbidente Limone Extra',
    description: '',
    categoryIds: ['ammorbidenti'],
    lineId: 'agrumi-di-sicilia',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 1000',
        volume: 1000,
        unit: 'ml',
        priceModifier: 7.0,
        weightGrams: 1100,
      },
    ],
    weightGrams: 1500,
    price: 50,
    currency: 'EUR',
    isBestSeller: true,
  },
  {
    id: 'prod-030',
    sku: 'art.0000030',
    slug: 'sgrassatore-professionale',
    title: 'Sgrassatore Professionale',
    description: '',
    categoryIds: ['sgrassatori'],
    lineId: 'neutro',
    images: [{ src: DEFAULT_IMAGE, alt: 'Product image' }],
    variants: [
      { id: 'v1', label: 'ml 500', volume: 500, unit: 'ml', priceModifier: 0, weightGrams: 550 },
      {
        id: 'v2',
        label: 'ml 2000',
        volume: 2000,
        unit: 'ml',
        priceModifier: 15.0,
        weightGrams: 2200,
      },
    ],
    weightGrams: 1800,
    price: 100,
    currency: 'EUR',
  },
];
