import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users } from 'lucide-react';

export const Tab2: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Faculty Database
          </CardTitle>
          <CardDescription>Manage faculty information and profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 text-primary/20" />
            <p className="text-lg">Faculty Database Module</p>
            <p className="text-sm mt-2">This section will contain faculty management features</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
