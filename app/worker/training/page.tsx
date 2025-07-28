"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"

type TrainingProgram = {
    id: string;
    title: string;
    category: string;
    duration: string;
    description: string;
    status: 'active' | 'archived';
    createdAt: string;
};

const TrainingCard = ({ training }: { training: TrainingProgram }) => {
    const [status, setStatus] = useState<'start' | 'inprogress' | 'completed'>('start');
    const [progress, setProgress] = useState(0);

    const handleButtonClick = () => {
        if (status === 'start') {
            setStatus('inprogress');
            setProgress(33);
        }
        else if (status === 'inprogress') {
            setStatus('completed');
            setProgress(100);
        }
    }

    const getButtonText = () => {
        if (status === 'start') return 'Start Course';
        if (status === 'inprogress') return 'Mark as Completed';
        if (status === 'completed') return 'Course Completed';
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{training.title}</CardTitle>
                <CardDescription>
                    <Badge variant="secondary">{training.category}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground">{training.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {training.duration}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                {status === 'completed' && <div className="text-green-600 text-xs mt-2">Congratulations! You completed this course.</div>}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleButtonClick} disabled={status === 'completed'}>
                    {status === 'completed' && <CheckCircle className="mr-2 h-4 w-4" />}
                    {getButtonText()}
                </Button>
            </CardFooter>
        </Card>
    )
};

const TrainingCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-5 w-24" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

function WorkerTrainingPage() {
    const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTrainings = async () => {
            setLoading(true);
            try {
                // Fetch training programs from Firebase
                const trainingsQuery = query(
                    collection(db, 'trainingPrograms'),
                    where('status', '==', 'active'),
                    orderBy('createdAt', 'desc')
                );
                
                const querySnapshot = await getDocs(trainingsQuery);
                const trainingData: TrainingProgram[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || 'Training Program',
                        category: data.category || 'General',
                        duration: data.duration || 'N/A',
                        description: data.description || 'No description available',
                        status: data.status || 'active',
                        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
                    };
                });
                
                setTrainings(trainingData);
            } catch (error) {
                console.error('Error fetching training programs:', error);
                // If no training programs exist, set empty array
                setTrainings([]);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch training programs.",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchTrainings();
    }, [toast]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Training & Development</h1>
                <p className="text-muted-foreground">Invest in your skills and grow your career.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <TrainingCardSkeleton key={i} />)
                ) : trainings.length > 0 ? (
                    trainings.map(training => <TrainingCard key={training.id} training={training} />)
                ) : (
                    <p className="text-center col-span-full py-10 text-muted-foreground">No training programs available at the moment.</p>
                )}
            </div>
        </div>
    )
}

export default WorkerTrainingPage;

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';
