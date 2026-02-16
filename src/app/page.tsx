"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, differenceInBusinessDays, addDays, isSameDay, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Bell,
  LogOut,
  User,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Building2,
  UserCog,
  CalendarDays,
  TrendingUp,
  Briefcase,
  Home,
  FileCheck,
  Clock4,
  Ban
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Types
type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  departmentId?: string | null
  managerId?: string | null
  department?: { id: string; name: string }
  manager?: { id: string; name: string }
  teamMembers?: { id: string; name: string; email: string }[]
}

interface LeaveType {
  id: string
  name: string
  description?: string
  defaultDays: number
  color: string
  carryForward: boolean
  maxCarryDays: number
}

interface LeaveBalance {
  id: string
  leaveTypeId: string
  totalDays: number
  usedDays: number
  pendingDays: number
  carriedDays: number
  leaveType: LeaveType
}

interface LeaveRequest {
  id: string
  userId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  totalDays: number
  halfDay: boolean
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  rejectionReason?: string
  appliedAt: string
  approvedAt?: string
  approvedBy?: string
  user?: { id: string; name: string; email: string; department?: { name: string } }
  leaveType: LeaveType
  approver?: { id: string; name: string }
}

interface Department {
  id: string
  name: string
  description?: string
  _count?: { users: number }
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link?: string
  createdAt: string
}

interface Holiday {
  id: string
  name: string
  date: string
  isRecurring: boolean
}

// Login Component
function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError("Invalid email or password")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Leave Management</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">Test Accounts:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> admin@company.com / password123</p>
              <p><strong>Manager:</strong> manager.eng@company.com / password123</p>
              <p><strong>Employee:</strong> employee1@company.com / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Stats Component
function StatsCards({ user }: { user: User }) {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    teamOnLeave: 0,
    totalBalance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reportsRes, balancesRes, requestsRes] = await Promise.all([
          fetch("/api/reports?type=summary"),
          fetch("/api/leave-balances"),
          fetch("/api/leave-requests?status=PENDING")
        ])

        if (reportsRes.ok) {
          const data = await reportsRes.json()
          setStats(prev => ({
            ...prev,
            pendingRequests: data.pendingRequests || 0,
            approvedRequests: data.approvedRequests || 0
          }))
        }

        if (balancesRes.ok) {
          const balances: LeaveBalance[] = await balancesRes.json()
          const totalBalance = balances.reduce((acc, b) => 
            acc + (b.totalDays - b.usedDays - b.pendingDays), 0
          )
          setStats(prev => ({ ...prev, totalBalance }))
        }

        if (requestsRes.ok && user.role !== "EMPLOYEE") {
          const requests: LeaveRequest[] = await requestsRes.json()
          setStats(prev => ({ ...prev, pendingRequests: requests.length }))
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user.role])

  const cards = [
    {
      title: "Available Leave",
      value: stats.totalBalance,
      description: "days remaining",
      icon: CalendarDays,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: user.role === "EMPLOYEE" ? "Pending Requests" : "Team Pending",
      value: stats.pendingRequests,
      description: "awaiting approval",
      icon: Clock4,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Approved This Year",
      value: stats.approvedRequests,
      description: "requests approved",
      icon: FileCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    }
  ]

  if (user.role !== "EMPLOYEE") {
    cards.push({
      title: "Team Members",
      value: user.teamMembers?.length || 0,
      description: "in your team",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    })
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(cards.length)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
              <div className={cn("p-3 rounded-xl", card.bgColor)}>
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Leave Balance Card
function LeaveBalanceCard() {
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leave-balances")
      .then(res => res.json())
      .then(data => {
        setBalances(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="p-6 h-48" /></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leave Balances</CardTitle>
        <CardDescription>Your available leave days for {new Date().getFullYear()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance) => {
          const remaining = balance.totalDays - balance.usedDays - balance.pendingDays
          const percentage = (remaining / balance.totalDays) * 100
          
          return (
            <div key={balance.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: balance.leaveType.color }}
                  />
                  <span className="font-medium text-sm">{balance.leaveType.name}</span>
                </div>
                <span className="text-sm font-bold">
                  {remaining.toFixed(1)} / {balance.totalDays} days
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{ 
                  backgroundColor: `${balance.leaveType.color}20`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Used: {balance.usedDays}</span>
                <span>Pending: {balance.pendingDays}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Apply Leave Form
function ApplyLeaveForm({ onSuccess }: { onSuccess: () => void }) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    halfDay: false,
    reason: ""
  })

  useEffect(() => {
    fetch("/api/leave-types")
      .then(res => res.json())
      .then(setLeaveTypes)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveTypeId: formData.leaveTypeId,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          halfDay: formData.halfDay,
          reason: formData.reason
        })
      })

      if (res.ok) {
        toast.success("Leave request submitted successfully")
        setFormData({
          leaveTypeId: "",
          startDate: undefined,
          endDate: undefined,
          halfDay: false,
          reason: ""
        })
        onSuccess()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to submit request")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      if (formData.halfDay) return 0.5
      return differenceInBusinessDays(formData.endDate, formData.startDate) + 1
    }
    return 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Apply for Leave</CardTitle>
        <CardDescription>Submit a new leave request</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <Select 
              value={formData.leaveTypeId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, leaveTypeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date, endDate: date || prev.endDate }))}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    disabled={(date) => date < (formData.startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="halfDay"
              checked={formData.halfDay}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, halfDay: !!checked }))}
            />
            <Label htmlFor="halfDay" className="text-sm font-normal">Half day leave</Label>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">Duration: {calculateDays()} day(s)</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              placeholder="Please provide a reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// My Leave Requests
function MyLeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/leave-requests")
      if (res.ok) {
        setRequests(await res.json())
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      const res = await fetch(`/api/leave-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" })
      })

      if (res.ok) {
        toast.success("Leave request cancelled")
        fetchRequests()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to cancel")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      PENDING: { variant: "secondary", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
      APPROVED: { variant: "secondary", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
      REJECTED: { variant: "secondary", className: "bg-red-100 text-red-800 hover:bg-red-100" },
      CANCELLED: { variant: "secondary", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
    }
    const style = styles[status] || styles.PENDING
    return (
      <Badge variant={style.variant} className={style.className}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="p-6 h-64" /></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Leave Requests</CardTitle>
        <CardDescription>View and manage your leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: request.leaveType.color }}
                        />
                        <span className="font-medium">{request.leaveType.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(request.startDate), "MMM d, yyyy")}</p>
                        {request.startDate !== request.endDate && (
                          <p className="text-muted-foreground">to {format(new Date(request.endDate), "MMM d, yyyy")}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{request.totalDays}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === "PENDING" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Ban className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will cancel your leave request.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No, keep it</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancel(request.id)}
                                disabled={cancellingId === request.id}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Yes, cancel request
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {request.status === "REJECTED" && request.rejectionReason && (
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                          Reason: {request.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Approvals Panel (for Managers/Admins)
function ApprovalsPanel() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/leave-requests?status=PENDING")
      if (res.ok) {
        setRequests(await res.json())
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (id: string, action: "approve" | "reject", reason?: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/leave-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: reason })
      })

      if (res.ok) {
        toast.success(`Leave request ${action}d`)
        fetchRequests()
      } else {
        const data = await res.json()
        toast.error(data.error || `Failed to ${action}`)
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setProcessingId(null)
      setRejectDialogOpen(false)
      setRejectionReason("")
      setSelectedRequestId(null)
    }
  }

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="p-6 h-64" /></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pending Approvals</CardTitle>
        <CardDescription>Review and approve/reject leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {request.user?.name?.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{request.user?.department?.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: request.leaveType.color }}
                        />
                        {request.leaveType.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(request.startDate), "MMM d")}</p>
                        <p className="text-muted-foreground">to {format(new Date(request.endDate), "MMM d, yyyy")}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.totalDays}</TableCell>
                    <TableCell>
                      <p className="text-sm max-w-[150px] truncate">{request.reason}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleAction(request.id, "approve")}
                          disabled={processingId === request.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setSelectedRequestId(request.id)
                            setRejectDialogOpen(true)
                          }}
                          disabled={processingId === request.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequestId && handleAction(selectedRequestId, "reject", rejectionReason)}
              disabled={!rejectionReason.trim()}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Team Calendar
function TeamCalendar({ user }: { user: User }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const year = currentMonth.getFullYear()
        const [requestsRes, holidaysRes] = await Promise.all([
          fetch("/api/leave-requests"),
          fetch(`/api/holidays?year=${year}`)
        ])

        if (requestsRes.ok) {
          const data: LeaveRequest[] = await requestsRes.json()
          setRequests(data.filter(r => r.status === "APPROVED"))
        }

        if (holidaysRes.ok) {
          setHolidays(await holidaysRes.json())
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentMonth])

  const getLeaveForDate = (date: Date) => {
    return requests.filter(r => {
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      return isWithinInterval(date, { start, end })
    })
  }

  const getHolidayForDate = (date: Date) => {
    return holidays.find(h => isSameDay(new Date(h.date), date))
  }

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="p-6 h-96" /></Card>
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Team Calendar</CardTitle>
            <CardDescription>View team leave schedule</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
            >
              Previous
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square p-1" />
          ))}
          {days.map((day) => {
            const leaves = getLeaveForDate(day)
            const holiday = getHolidayForDate(day)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "aspect-square p-1 border rounded-lg text-sm",
                  isWeekend && "bg-muted/50",
                  isToday && "border-primary border-2",
                  holiday && "bg-red-50 dark:bg-red-950/30"
                )}
              >
                <div className="flex flex-col h-full">
                  <span className={cn("font-medium", isToday && "text-primary")}>
                    {format(day, "d")}
                  </span>
                  {holiday && (
                    <span className="text-[10px] text-red-600 truncate">{holiday.name}</span>
                  )}
                  {leaves.length > 0 && (
                    <div className="flex-1 flex flex-wrap gap-0.5 mt-1">
                      {leaves.slice(0, 3).map((leave, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: leave.leaveType.color }}
                          title={`${leave.user?.name} - ${leave.leaveType.name}`}
                        />
                      ))}
                      {leaves.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">+{leaves.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-primary" />
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Admin Panel
function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)

  // User form state
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "EMPLOYEE" as UserRole,
    departmentId: "",
    managerId: ""
  })

  // Department form state
  const [deptDialogOpen, setDeptDialogOpen] = useState(false)
  const [deptForm, setDeptForm] = useState({ name: "", description: "" })

  // Leave type form state
  const [leaveTypeDialogOpen, setLeaveTypeDialogOpen] = useState(false)
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: "",
    description: "",
    defaultDays: "0",
    color: "#6B7280",
    carryForward: false,
    maxCarryDays: "0"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deptsRes, typesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/departments"),
          fetch("/api/leave-types")
        ])

        if (usersRes.ok) setUsers(await usersRes.json())
        if (deptsRes.ok) setDepartments(await deptsRes.json())
        if (typesRes.ok) setLeaveTypes(await typesRes.json())
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateUser = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm)
      })

      if (res.ok) {
        toast.success("User created successfully")
        const newUser = await res.json()
        setUsers([...users, newUser])
        setUserDialogOpen(false)
        setUserForm({ email: "", password: "", name: "", role: "EMPLOYEE", departmentId: "", managerId: "" })
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create user")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("User deleted")
        setUsers(users.filter(u => u.id !== id))
      }
    } catch {
      toast.error("Failed to delete user")
    }
  }

  const handleCreateDepartment = async () => {
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deptForm)
      })

      if (res.ok) {
        toast.success("Department created")
        const newDept = await res.json()
        setDepartments([...departments, newDept])
        setDeptDialogOpen(false)
        setDeptForm({ name: "", description: "" })
      }
    } catch {
      toast.error("Failed to create department")
    }
  }

  const handleCreateLeaveType = async () => {
    try {
      const res = await fetch("/api/leave-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leaveTypeForm,
          defaultDays: parseFloat(leaveTypeForm.defaultDays),
          maxCarryDays: parseFloat(leaveTypeForm.maxCarryDays)
        })
      })

      if (res.ok) {
        toast.success("Leave type created")
        const newType = await res.json()
        setLeaveTypes([...leaveTypes, newType])
        setLeaveTypeDialogOpen(false)
        setLeaveTypeForm({ name: "", description: "", defaultDays: "0", color: "#6B7280", carryForward: false, maxCarryDays: "0" })
      }
    } catch {
      toast.error("Failed to create leave type")
    }
  }

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="p-6 h-96" /></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Admin Panel</CardTitle>
        <CardDescription>Manage users, departments, and leave types</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="leaveTypes">Leave Types</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Manage Users</h3>
              <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      />
                    </div>
                    {!editingUser && (
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v as UserRole })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={userForm.departmentId} onValueChange={(v) => setUserForm({ ...userForm, departmentId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser}>{editingUser ? "Update" : "Create"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department?.name || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Manage Departments</h3>
              <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Department</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={deptForm.name}
                        onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={deptForm.description}
                        onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeptDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateDepartment}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Members</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.description || "-"}</TableCell>
                      <TableCell>{dept._count?.users || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="leaveTypes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Manage Leave Types</h3>
              <Dialog open={leaveTypeDialogOpen} onOpenChange={setLeaveTypeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Leave Type
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Leave Type</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={leaveTypeForm.name}
                        onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={leaveTypeForm.description}
                        onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default Days</Label>
                        <Input
                          type="number"
                          value={leaveTypeForm.defaultDays}
                          onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, defaultDays: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={leaveTypeForm.color}
                          onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="carryForward"
                        checked={leaveTypeForm.carryForward}
                        onCheckedChange={(checked) => setLeaveTypeForm({ ...leaveTypeForm, carryForward: !!checked })}
                      />
                      <Label htmlFor="carryForward">Allow carry forward</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setLeaveTypeDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateLeaveType}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Default Days</TableHead>
                    <TableHead>Carry Forward</TableHead>
                    <TableHead>Color</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                          <span className="font-medium">{type.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{type.defaultDays}</TableCell>
                      <TableCell>{type.carryForward ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: type.color }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Reports Component
function ReportsPanel() {
  const [reportData, setReportData] = useState<{
    totalUsers: number
    totalDepartments: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    leaveTypeStats: Array<{
      leaveTypeId: string
      _sum: { totalDays: number | null }
      _count: number
      leaveType?: LeaveType
    }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports?type=summary&year=${year}`)
        if (res.ok) {
          setReportData(await res.json())
        }
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [year])

  if (loading) {
    return <Card className="animate-pulse"><CardContent className="p-6 h-96" /></Card>
  }

  if (!reportData) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Reports & Analytics</CardTitle>
            <CardDescription>Leave statistics for {year}</CardDescription>
          </div>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-2xl font-bold">{reportData.totalUsers}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Departments</p>
            <p className="text-2xl font-bold">{reportData.totalDepartments}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{reportData.pendingRequests}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{reportData.approvedRequests}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-4">Leave Type Usage</h4>
          <div className="space-y-3">
            {reportData.leaveTypeStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: stat.leaveType?.color }}
                  />
                  <span className="font-medium">{stat.leaveType?.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{stat._count} requests</span>
                  <span className="font-bold">{stat._sum.totalDays || 0} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Notifications Panel
function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    !notification.isRead && "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      notification.type === "approval" && "bg-emerald-500",
                      notification.type === "rejection" && "bg-red-500",
                      notification.type === "leave_request" && "bg-blue-500",
                      notification.type === "reminder" && "bg-amber-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
function Dashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLeaveSubmitted = () => {
    setRefreshKey(prev => prev + 1)
    setActiveTab("requests")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">Leave Management</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1">
                    <span className="font-medium">New Request</span>
                    <span className="text-xs text-muted-foreground">Alice Brown requested annual leave</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-transparent p-0">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="apply" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Apply Leave
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              My Requests
            </TabsTrigger>
            <TabsTrigger value="balance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="w-4 h-4 mr-2" />
              Leave Balance
            </TabsTrigger>
            {user.role !== "EMPLOYEE" && (
              <TabsTrigger value="approvals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approvals
              </TabsTrigger>
            )}
            <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            {user.role === "ADMIN" && (
              <>
                <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserCog className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <StatsCards user={user} />
            <div className="grid gap-6 lg:grid-cols-2">
              <LeaveBalanceCard key={refreshKey} />
              <NotificationsPanel />
            </div>
          </TabsContent>

          <TabsContent value="apply">
            <div className="max-w-2xl mx-auto">
              <ApplyLeaveForm onSuccess={handleLeaveSubmitted} />
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <MyLeaveRequests />
          </TabsContent>

          <TabsContent value="balance">
            <LeaveBalanceCard />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalsPanel />
          </TabsContent>

          <TabsContent value="calendar">
            <TeamCalendar user={user} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsPanel />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto py-4 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Leave Management System © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}

// Main App
export default function LeaveManagementApp() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return <Dashboard user={session.user as User} />
}
