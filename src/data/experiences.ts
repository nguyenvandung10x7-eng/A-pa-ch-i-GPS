import type { ExperienceMode } from '../services/experienceFilters';

export type ExperienceTheme =
  | 'terrace'
  | 'waterfall'
  | 'timeTrain'
  | 'apaChai'
  | 'historical'
  | 'plain'
  | 'city'
  | 'surprise';

export type ExperienceCardConfig = {
  id: string;
  order: number;
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
  image: string;
  imageAltKey: string;
  route: string;
  mode: ExperienceMode;
  theme?: ExperienceTheme;
};

export const experienceCards: ExperienceCardConfig[] = [
  {
    id: 'terraced-fields',
    order: 1,
    titleKey: 'experiences.card.terracedFields.title',
    descriptionKey: 'experiences.card.terracedFields.description',
    actionKey: 'experiences.card.terracedFields.action',
    image: '/images/tasks/ruong-bac-thang-ta-leng-mthen.webp',
    imageAltKey: 'experiences.card.terracedFields.imageAlt',
    route: '/challenge?experience=terraced-fields',
    mode: 'terraced-fields',
    theme: 'terrace',
  },
  {
    id: 'waterfalls',
    order: 2,
    titleKey: 'experiences.card.waterfalls.title',
    descriptionKey: 'experiences.card.waterfalls.description',
    actionKey: 'experiences.card.waterfalls.action',
    image: '/images/tasks/thac-ke-nenh-mthen.webp',
    imageAltKey: 'experiences.card.waterfalls.imageAlt',
    route: '/challenge?experience=waterfalls',
    mode: 'waterfalls',
    theme: 'waterfall',
  },
  {
    id: 'time-train',
    order: 3,
    titleKey: 'experiences.card.timeTrain.title',
    descriptionKey: 'experiences.card.timeTrain.description',
    actionKey: 'experiences.card.timeTrain.action',
    image: '/images/tasks/doi-a1-khoanh-khac-tuong-niem.webp',
    imageAltKey: 'experiences.card.timeTrain.imageAlt',
    route: '/challenge?experience=time-train',
    mode: 'time-train',
    theme: 'timeTrain',
  },
  {
    id: 'apa-chai',
    order: 4,
    titleKey: 'experiences.card.apaChai.title',
    descriptionKey: 'experiences.card.apaChai.description',
    actionKey: 'experiences.card.apaChai.action',
    image: '/images/tasks/cot-co-a-pa-chai.webp',
    imageAltKey: 'experiences.card.apaChai.imageAlt',
    route: '/challenge?experience=apa-chai',
    mode: 'apa-chai',
    theme: 'apaChai',
  },
  {
    id: 'historical-sites',
    order: 5,
    titleKey: 'experiences.card.historicalSites.title',
    descriptionKey: 'experiences.card.historicalSites.description',
    actionKey: 'experiences.card.historicalSites.action',
    image: '/images/tasks/bao-tang-chien-thang-dien-bien-phu-trai-nghiem.webp',
    imageAltKey: 'experiences.card.historicalSites.imageAlt',
    route: '/challenge?experience=historical-sites',
    mode: 'historical-sites',
    theme: 'historical',
  },
  {
    id: 'dien-bien-plain',
    order: 6,
    titleKey: 'experiences.card.dienBienPlain.title',
    descriptionKey: 'experiences.card.dienBienPlain.description',
    actionKey: 'experiences.card.dienBienPlain.action',
    image: '/images/tasks/canh-dong-muong-thanh-cat-banh.webp',
    imageAltKey: 'experiences.card.dienBienPlain.imageAlt',
    route: '/challenge?experience=dien-bien-plain',
    mode: 'dien-bien-plain',
    theme: 'plain',
  },
  {
    id: 'in-the-city',
    order: 7,
    titleKey: 'experiences.card.inTheCity.title',
    descriptionKey: 'experiences.card.inTheCity.description',
    actionKey: 'experiences.card.inTheCity.action',
    image: '/images/tasks/quang-truong-7-5-mthen.webp',
    imageAltKey: 'experiences.card.inTheCity.imageAlt',
    route: '/challenge?experience=in-the-city',
    mode: 'in-the-city',
    theme: 'city',
  },
  {
    id: 'surprise-missions',
    order: 8,
    titleKey: 'experiences.card.surpriseMissions.title',
    descriptionKey: 'experiences.card.surpriseMissions.description',
    actionKey: 'experiences.card.surpriseMissions.action',
    image: '/images/tasks/cho-noong-bua-trai-ban.webp',
    imageAltKey: 'experiences.card.surpriseMissions.imageAlt',
    route: '/challenge?experience=surprise-missions',
    mode: 'surprise-missions',
    theme: 'surprise',
  },
];
