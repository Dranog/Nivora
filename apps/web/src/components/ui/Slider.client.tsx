"use client";

import dynamic from 'next/dynamic';
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

// Export des types pour compatibilité
export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

// Import dynamique avec désactivation SSR
// Ceci empêche Next.js d'essayer d'importer le module côté serveur
const Slider = dynamic(
  () => import('./slider').then(mod => mod.Slider),
  {
    ssr: false,
    loading: () => null,
  }
) as React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<React.ElementRef<typeof SliderPrimitive.Root>>>;

export default Slider;
