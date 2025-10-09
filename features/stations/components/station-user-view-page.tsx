"use client";

import React from "react";
import { useData } from "@/hooks/useData";
import { getSingleStation } from "@/actions/superAdmin/station";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  User,
  Phone,
  Calendar,
  Hash,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface StationUserViewPageProps {
  userId: string;
  stationId: string;
}

export default function StationUserViewPage({ userId, stationId }: StationUserViewPageProps) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // For now, we'll create a mock user data since we don't have a getSingleUser function
  // In a real implementation, you would create this function
  const mockUser = {
    id: userId,
    username: "stationadmin1",
    phone: "0933333333",
    role: "stationAdmin",
    status: "ACTIVE",
    isAdmin: true,
    isActive: true,
    createdAt: new Date("2025-10-08T17:39:04.188Z"),
    updatedAt: new Date("2025-10-08T17:39:04.188Z"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/station/${stationId}/stationUser`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{mockUser.username}</h1>
            <p className="text-muted-foreground">User Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    User ID
                  </div>
                  <Badge variant="secondary" className="text-sm font-mono">
                    {mockUser.id.slice(0, 8)}...
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Username
                  </div>
                  <p className="text-sm font-medium">{mockUser.username}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                  <p className="text-lg font-medium font-mono">{mockUser.phone}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Role
                  </div>
                  <Badge 
                    variant="default"
                    className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
                  >
                    Station Admin
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>User Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {mockUser.isActive ? (
                    <UserCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={mockUser.isActive ? "default" : "destructive"}>
                    {mockUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Admin</span>
                <Badge variant={mockUser.isAdmin ? "default" : "secondary"}>
                  {mockUser.isAdmin ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {mockUser.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isSuperAdmin ? (
                <>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit User
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Super admin actions only
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
