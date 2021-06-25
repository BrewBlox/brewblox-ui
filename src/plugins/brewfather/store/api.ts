import { http, intercept } from '@/utils/http';

import { BrewfatherRecipe } from '../types';

export const fetchRecipes = (serviceId: string): Promise<BrewfatherRecipe[]> =>
  http.get<BrewfatherRecipe[]>(`/${serviceId}/recipes`)
    .then(resp => resp.data)
    .catch(intercept('Failed to fetch recipes'));

export const fetchRecipe = (serviceId: string, id: string): Promise<BrewfatherRecipe> =>
  http.get<BrewfatherRecipe>(`/${serviceId}/recipe/${encodeURIComponent(id)}`)
    .then(resp => resp.data)
    .catch(intercept(`Failed to fetch recipe ${id}`));


export const loadRecipe = (serviceId: string, id: string): Promise<undefined> =>
  http.get<undefined>(`/${serviceId}/recipe/${encodeURIComponent(id)}/load`)
    .then(() => undefined)
    .catch(intercept(`Failed to load recipe ${id}`));

export const startMashAutomation = (serviceId: string): Promise<undefined> =>
  http.get<undefined>(`/${serviceId}/startmash`)
    .then(() => undefined)
    .catch(intercept('Failed to start mash'));
