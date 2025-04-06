import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import HouseBuilder from "@/components/house-builder/house-builder";

export default function HouseBuilderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#264653]">3D House Builder</h1>
      
      <Card>
        <CardContent className="p-6">
          <HouseBuilder />
        </CardContent>
      </Card>
    </div>
  );
}