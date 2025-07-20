"use client"

import * as React from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc, writeBatch, collection, query, where, orderBy, onSnapshot } from "firebase/firestore"

export interface Notification {
  id: string
  title: string
  description: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const typeColors = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800", 
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800"
  }

  return (
    <Card className={`mb-2 ${!notification.read ? "border-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <Badge className={typeColors[notification.type]} variant="secondary">
                {notification.type}
              </Badge>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {notification.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationCenter() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const setupRealtimeNotifications = React.useCallback(() => {
    if (!user) return

    setLoading(true)
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationData: Notification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        notificationData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          type: data.type || 'info',
          read: data.read || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          actionUrl: data.actionUrl
        })
      })
      setNotifications(notificationData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching notifications:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications"
      })
      setLoading(false)
    })

    return unsubscribe
  }, [user, toast])

  React.useEffect(() => {
    if (user && open) {
      setupRealtimeNotifications()
    }
  }, [user, open, setupRealtimeNotifications])

  const fetchNotifications = async () => {
    // Fallback method if real-time doesn't work
    if (!user) return
    
    setLoading(true)
    try {
      // For demo purposes, show sample notifications if none exist
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New booking request",
          description: "You have a new cleaning service request",
          type: "info",
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: "2", 
          title: "Payment received",
          description: "Payment of $50 has been processed",
          type: "success",
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      setNotifications(mockNotifications)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications"
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      
      // Update notification in Firebase
      if (user) {
        const notificationRef = doc(db, 'notifications', id)
        await updateDoc(notificationRef, { read: true })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read"
      })
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id))
      
      // Delete notification from Firebase
      if (user) {
        const notificationRef = doc(db, 'notifications', id)
        await deleteDoc(notificationRef)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to delete notification"
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      
      // Update all unread notifications in Firebase
      if (user) {
        const unreadNotifications = notifications.filter(n => !n.read)
        const batch = writeBatch(db)
        
        unreadNotifications.forEach(notification => {
          const notificationRef = doc(db, 'notifications', notification.id)
          batch.update(notificationRef, { read: true })
        })
        
        await batch.commit()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read"
      })
    }
  }

  // Don't render if user is not authenticated and not loading
  if (!user && !authLoading) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" disabled={authLoading}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-80">
          <div className="p-4">
            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
