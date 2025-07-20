
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { matchWorkersToJob, type MatchResult } from "@/ai/flows/match-worker-flow"
import type { Job } from "./actions"
import { assignWorkerToJob } from "./actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const MatchSkeleton = () => (
    <div className="flex items-center gap-4 py-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-10 w-24" />
    </div>
)


export function MatchDialog({ open, onOpenChange, job, onJobAssigned }: { open: boolean, onOpenChange: (open: boolean) => void, job: Job, onJobAssigned: () => void }) {
    const { toast } = useToast()
    const [matches, setMatches] = React.useState<MatchResult[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if (open && job) {
            const getMatches = async () => {
                setLoading(true)
                setMatches([])
                try {
                    const results = await matchWorkersToJob({ jobId: job.id });
                    setMatches(results);
                } catch (error) {
                    console.error("Failed to get AI matches:", error)
                    toast({
                        variant: "destructive",
                        title: "AI Matching Failed",
                        description: "Could not get worker recommendations. Please try again later.",
                    })
                } finally {
                    setLoading(false)
                }
            }
            getMatches()
        }
    }, [open, job, toast])

    const handleAssign = async (workerId: string, workerName: string) => {
        const result = await assignWorkerToJob(job.id, workerId, workerName);
        if (result.success) {
            toast({
                title: "Worker Assigned!",
                description: `${workerName} has been assigned to the job "${job.jobTitle}".`
            });
            onJobAssigned();
            onOpenChange(false);
        } else {
            toast({
                variant: "destructive",
                title: "Assignment Failed",
                description: result.error,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>AI Smart Match Results</DialogTitle>
                    <DialogDescription>
                        Top worker recommendations for the job: "{job.jobTitle}"
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                   {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <MatchSkeleton key={i} />)
                   ) : matches.length > 0 ? (
                        matches.map(match => (
                            <div key={match.workerId} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={match.profilePictureUrl || `https://placehold.co/100x100.png`} />
                                    <AvatarFallback>{match.workerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{match.workerName}</p>
                                        <Badge variant={match.score > 80 ? "default" : "secondary"} className={match.score > 80 ? "bg-green-500" : ""}>
                                            Score: {match.score}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{match.justification}</p>
                                </div>
                                <Button size="sm" onClick={() => handleAssign(match.workerId, match.workerName)}>
                                    Assign
                                </Button>
                            </div>
                        ))
                   ) : (
                        <p className="text-center text-muted-foreground py-8">No suitable active workers found.</p>
                   )}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
