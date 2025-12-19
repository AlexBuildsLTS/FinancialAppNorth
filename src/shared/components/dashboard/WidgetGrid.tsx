import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import DraggableFlatList, { 
  RenderItemParams, 
  ScaleDecorator 
} from 'react-native-draggable-flatlist';
import { GripVertical, X } from 'lucide-react-native';
import { GlassCard } from '../GlassCard'; // Adjust path to your component
import { LineChart, BarChart } from 'react-native-chart-kit'; // Visualization library

// --- TYPES ---
export type WidgetType = 'cashflow' | 'burn_rate' | 'revenue_trend' | 'recent_tx';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data: any; // Dynamic data from AnalyticsService
  isVisible: boolean;
}

interface WidgetGridProps {
  widgets: DashboardWidget[];
  onReorder: (data: DashboardWidget[]) => void;
  onRemove: (id: string) => void;
}

// --- RENDERERS FOR DIFFERENT WIDGET TYPES ---
const WidgetContent = ({ widget, width }: { widget: DashboardWidget; width: number }) => {
  const chartConfig = {
    backgroundGradientFrom: '#112240',
    backgroundGradientTo: '#112240',
    color: (opacity = 1) => `rgba(100, 255, 218, ${opacity})`, // #64FFDA
    labelColor: (opacity = 1) => `rgba(136, 146, 176, ${opacity})`,
    strokeWidth: 2,
  };

  switch (widget.type) {
    case 'cashflow':
      return (
        <LineChart
          data={widget.data}
          width={width - 48} // Padding adjustment
          height={180}
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 16, marginTop: 8 }}
        />
      );
    case 'revenue_trend':
      return (
        <BarChart
              data={widget.data}
              width={width - 48}
              height={180}
              yAxisLabel="$"
              chartConfig={chartConfig}
              style={{ borderRadius: 16, marginTop: 8 }} yAxisSuffix={''}        />
      );
    default:
      return (
        <View className="items-center justify-center h-32">
          <Text className="text-[#8892B0]">Widget data not available</Text>
        </View>
      );
  }
};

// --- MAIN COMPONENT ---
export const WidgetGrid = ({ widgets, onReorder, onRemove }: WidgetGridProps) => {
  const { width } = useWindowDimensions();

  const renderItem = ({ item, drag, isActive }: RenderItemParams<DashboardWidget>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          activeOpacity={1}
          style={{ marginBottom: 16 }}
        >
          <GlassCard className={`p-4 border ${isActive ? 'border-[#64FFDA]' : 'border-[#233554]'} bg-[#112240]/80`}>
            {/* Widget Header */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                {/* Drag Handle */}
                <TouchableOpacity onPressIn={drag} hitSlop={10}>
                  <GripVertical size={20} color="#8892B0" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-white">{item.title}</Text>
              </View>
              
              <TouchableOpacity onPress={() => onRemove(item.id)}>
                <X size={18} color="#8892B0" />
              </TouchableOpacity>
            </View>

            {/* Widget Content */}
            <WidgetContent widget={item} width={width} />
          </GlassCard>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View className="flex-1">
      <DraggableFlatList
        data={widgets.filter(w => w.isVisible)}
        onDragEnd={({ data }) => onReorder(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        containerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};