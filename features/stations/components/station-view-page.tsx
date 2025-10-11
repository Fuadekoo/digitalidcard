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
  Users,
  FileText,
  MapPin,
  Calendar,
  User,
  Hash,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface StationViewPageProps {
  stationId: string;
}

export default function StationViewPage({ stationId }: StationViewPageProps) {
  const { data: session } = useSession();
  const [data, isLoading, refresh] = useData(getSingleStation, null, stationId);

  // Check if user is super admin
  const isSuperAdmin = session?.user?.role === "superAdmin";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data?.status || !data.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/en/dashboard/station">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stations
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Station Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {data?.message ||
                "The station you're looking for could not be found."}
            </p>
            {!isSuperAdmin && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Access Denied</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  You need super admin privileges to view station details.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const station = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/en/dashboard/station">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stations
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{station.amharicName}</h1>
            <p className="text-muted-foreground">{station.afanOromoName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Station
              </Button>
              <Link href={`/dashboard/station/${stationId}/stationUser`}>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Super Admin Only</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Station Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Station Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    Station Code
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {station.code}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Station Admin
                  </div>
                  <p className="text-sm">{station.stationAdminName}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Station Name (Amharic)
                  </div>
                  <p className="text-lg font-medium">{station.amharicName}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Station Name (Oromo)
                  </div>
                  <p className="text-lg font-medium">{station.afanOromoName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Station Photos */}
          {(station.stampPhoto || station.signPhoto) && (
            <Card>
              <CardHeader>
                <CardTitle>Station Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {station.stampPhoto && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Stamp Photo</p>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={`/api/filedata/${station.stampPhoto}`}
                          alt="Station Stamp"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {station.signPhoto && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sign Photo</p>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={`/api/filedata/${station.signPhoto}`}
                          alt="Station Sign"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(station.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default">Active</Badge>
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
                  <Link href={`/dashboard/station/${stationId}/stationUser`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Station
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
