import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Settings } from 'lucide-react';

export const Tab4: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Settings
          </CardTitle>
          <CardDescription>Configure system preferences and options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="w-16 h-16 mx-auto mb-4 text-primary/20" />
            <p className="text-lg">Settings Module</p>
            <p className="text-sm mt-2">This section will contain system configuration options</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
