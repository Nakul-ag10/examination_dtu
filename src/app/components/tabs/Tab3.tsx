import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LayoutDashboard } from 'lucide-react';

export const Tab3: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Reports
          </CardTitle>
          <CardDescription>View analytics and generate reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-primary/20" />
            <p className="text-lg">Reports Module</p>
            <p className="text-sm mt-2">This section will contain reporting and analytics features</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
