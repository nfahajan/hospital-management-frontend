"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OwnersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owners</h1>
            <p className="text-gray-600">Manage hospital owners</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Owner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Owners</CardTitle>
            <CardDescription>
              List of all hospital owners in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Owner management functionality coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
