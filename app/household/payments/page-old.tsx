
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TicketPercent, Info } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getHouseholdPaymentHistory, processPayment, type Payment } from "./actions"
import { serviceOptions } from "@/lib/services"

const HistorySkeletonRow = () => (
    <TableRow>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell>
            <div className="w-fit">
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
        </TableCell>
    </TableRow>
)

export default function PaymentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [history, setHistory] = React.useState<Payment[]>([]);
    const [loadingHistory, setLoadingHistory] = React.useState(true);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [momoNumber, setMomoNumber] = React.useState("");
    
    // Mock data for the current bill
    const currentBill = {
        serviceType: 'deep_cleaning',
        workerName: 'Aline Uwamahoro',
        baseFee: 30000,
        platformFee: 2500,
        discount: -4500,
    };
    const totalAmount = currentBill.baseFee + currentBill.platformFee + currentBill.discount;

    const fetchHistory = React.useCallback(async () => {
        if (user) {
            setLoadingHistory(true);
            try {
                const paymentHistory = await getHouseholdPaymentHistory(user.uid);
                setHistory(paymentHistory);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not load payment history." });
            } finally {
                setLoadingHistory(false);
            }
        }
    }, [user, toast]);

    React.useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handlePayment = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to make a payment." });
            return;
        }
        if (!momoNumber || !/^(07)\d{8}$/.test(momoNumber)) {
            toast({ variant: "destructive", title: "Invalid Phone Number", description: "Please enter a valid 10-digit mobile money number starting with 07." });
            return;
        }

        setIsProcessing(true);
        toast({ title: "Initiating Payment...", description: "Please wait, you will be redirected." });
        
        const result = await processPayment(user.uid, {
            serviceType: currentBill.serviceType,
            workerName: currentBill.workerName,
            amount: totalAmount,
            phone: momoNumber,
        });

        if (result.success && result.redirectUrl) {
            // Redirect user to Paypack's payment page
            router.push(result.redirectUrl);
        } else {
            toast({ variant: "destructive", title: "Payment Failed", description: result.error || "Could not initiate the payment process." });
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'failed': return <Badge variant="destructive" className="bg-red-100 text-red-800">Failed</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount).replace('RWF', 'RWF ');
    };
    
    const getServiceName = (serviceId: string) => {
        return serviceOptions.find(s => s.id === serviceId)?.label || serviceId;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Complete Your Payment</h1>
                <p className="text-muted-foreground">Review your booking details and securely pay for the service.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Review the cost breakdown for your service with {currentBill.workerName}.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Service: {getServiceName(currentBill.serviceType)}</span>
                                <span>{formatCurrency(currentBill.baseFee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Platform Fee</span>
                                <span>{formatCurrency(currentBill.platformFee)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span className="text-muted-foreground">Discount</span>
                                <span>{formatCurrency(currentBill.discount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Select Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="momo" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <RadioGroupItem value="momo" id="momo" className="peer sr-only" />
                                    <Label htmlFor="momo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        Mobile Money
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="card" id="card" className="peer sr-only" disabled />
                                    <Label htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary opacity-50 cursor-not-allowed">
                                        Credit/Debit Card (Coming Soon)
                                    </Label>
                                </div>
                            </RadioGroup>
                            <div className="mt-6">
                                <Label htmlFor="momo-number">Mobile Money Number</Label>
                                <Input 
                                    id="momo-number" 
                                    placeholder="07..."
                                    value={momoNumber}
                                    onChange={(e) => setMomoNumber(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full" onClick={handlePayment} disabled={isProcessing}>
                                {isProcessing ? "Processing..." : `Pay ${formatCurrency(totalAmount)}`}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Your Subscription</CardTitle></CardHeader>
                        <CardContent>
                            <Alert>
                                <TicketPercent className="h-4 w-4" />
                                <AlertTitle>Gold Plan Member</AlertTitle>
                                <AlertDescription>You are getting a 15% discount on this booking.</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Information</CardTitle></CardHeader>
                        <CardContent>
                            <Alert variant="default" className="border-blue-500/50 text-blue-800 [&>svg]:text-blue-800">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Secure Payments</AlertTitle>
                                <AlertDescription className="text-blue-700">All transactions are encrypted. Your payment information is safe with us.</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>A record of all your past transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead className="hidden md:table-cell">Worker</TableHead>
                                <TableHead className="hidden sm:table-cell">Amount (RWF)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {loadingHistory ? (
                                Array.from({ length: 3 }).map((_, i) => <HistorySkeletonRow key={i} />)
                           ) : history.length > 0 ? (
                                history.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.date}</TableCell>
                                        <TableCell className="font-medium">{getServiceName(p.serviceType)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{p.workerName}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{formatCurrency(p.amount)}</TableCell>
                                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                                    </TableRow>
                                ))
                           ) : (
                               <TableRow>
                                   <TableCell colSpan={5} className="text-center h-24">No payment history found.</TableCell>
                               </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
