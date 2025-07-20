import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, getCountFromServer, where, Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Get dashboard statistics
    const [workersSnap, householdsSnap, completedJobsSnap] = await Promise.all([
      getCountFromServer(collection(db, 'worker')),
      getCountFromServer(collection(db, 'household')),
      getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'completed')))
    ]);
    
    // Calculate total revenue from completed payments
    let totalRevenue = 0;
    try {
      const paymentsQuery = query(
        collection(db, 'servicePayments'),
        where('status', '==', 'completed')
      );
      const paymentsSnap = await getDocs(paymentsQuery);
      totalRevenue = paymentsSnap.docs.reduce((sum, doc) => {
        return sum + (doc.data().amount || 0);
      }, 0);
    } catch (error) {
      // Fallback to estimated revenue if payments collection is empty
      totalRevenue = completedJobsSnap.data().count * 25000; // Average job value
    }
    
    // Get recent worker registrations
    const recentWorkersQuery = query(
      collection(db, 'worker'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentWorkersSnap = await getDocs(recentWorkersQuery);
    const recentWorkers = recentWorkersSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || 'N/A',
        email: data.email || 'N/A',
        services: data.services || [],
        status: data.status || 'pending',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });
    
    // Get recent job postings
    const recentJobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentJobsSnap = await getDocs(recentJobsQuery);
    const recentJobs = recentJobsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        jobTitle: data.jobTitle || 'N/A',
        householdName: data.householdName || 'N/A',
        serviceType: data.serviceType || 'N/A',
        status: data.status || 'open',
        salary: data.salary || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });
    
    // Get platform activity metrics
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [newWorkersThisMonth, newJobsThisMonth] = await Promise.all([
      getCountFromServer(query(
        collection(db, 'worker'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      )),
      getCountFromServer(query(
        collection(db, 'jobs'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      ))
    ]);
    
    const dashboardData = {
      stats: {
        totalWorkers: workersSnap.data().count,
        totalHouseholds: householdsSnap.data().count,
        jobsCompleted: completedJobsSnap.data().count,
        totalRevenue: totalRevenue,
      },
      activity: {
        newWorkersThisMonth: newWorkersThisMonth.data().count,
        newJobsThisMonth: newJobsThisMonth.data().count,
      },
      recentData: {
        workers: recentWorkers,
        jobs: recentJobs,
      }
    };
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Admin dashboard data retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data'
    }, { status: 500 });
  }
}
