import { Baby, Car, ChefHat, Dog, Leaf, PaintBucket, ShoppingCart, Sparkles, Shirt, Utensils, Wrench, HandPlatter, HeartHandshake, Accessibility } from "lucide-react";
import * as React from 'react';

type Service = {
    id: string;
    name: string;
    icon: React.ReactNode;
};

export const services: Service[] = [
    {
        id: "general_cleaning",
        name: "General Cleaning",
        icon: <PaintBucket className="h-full w-full" />,
    },
    {
        id: "deep_cleaning",
        name: "Deep Cleaning",
        icon: <Sparkles className="h-full w-full" />,
    },
    {
        id: "laundry",
        name: "Laundry & Ironing",
        icon: <Shirt className="h-full w-full" />,
    },
    {
        id: "child_care",
        name: "Child Care",
        icon: <Baby className="h-full w-full" />,
    },
    {
        id: "elderly_care",
        name: "Elderly Care",
        icon: <Accessibility className="h-full w-full" />,
    },
    {
        id: "personal_wellness_support",
        name: "Personal Wellness Support",
        icon: <HeartHandshake className="h-full w-full" />,
    },
    {
        id: "pet_care",
        name: "Pet Care",
        icon: <Dog className="h-full w-full" />,
    },
    {
        id: "chef_assistant",
        name: "Chef / Cooking",
        icon: <ChefHat className="h-full w-full" />,
    },
    {
        id: "personal_shopper",
        name: "Personal Shopper",
        icon: <ShoppingCart className="h-full w-full" />,
    },
    {
        id: "errands",
        name: "Running Errands",
        icon: <Car className="h-full w-full" />,
    },
    {
        id: "gardening",
        name: "Gardening",
        icon: <Leaf className="h-full w-full" />,
    },
    {
        id: "handyman",
        name: "Handyman",
        icon: <Wrench className="h-full w-full" />,
    },
];

export const serviceOptions = services.map(({ id, name }) => ({ id, label: name }));
