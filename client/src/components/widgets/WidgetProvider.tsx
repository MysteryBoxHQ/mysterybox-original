import React, { createContext, useContext, ReactNode } from 'react';

interface WidgetConfig {
  apiKey?: string;
  theme?: 'light' | 'dark';
  baseUrl?: string;
  userId?: string;
  partnerId?: string;
}

interface WidgetContextType {
  config: WidgetConfig;
  updateConfig: (newConfig: Partial<WidgetConfig>) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

interface WidgetProviderProps {
  config: WidgetConfig;
  children: ReactNode;
}

export function WidgetProvider({ config: initialConfig, children }: WidgetProviderProps) {
  const [config, setConfig] = React.useState<WidgetConfig>(initialConfig);

  const updateConfig = (newConfig: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <WidgetContext.Provider value={{ config, updateConfig }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgetConfig() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgetConfig must be used within a WidgetProvider');
  }
  return context;
}

// Widget Factory for easy embedding
export class RollingDropWidgets {
  private config: WidgetConfig;

  constructor(config: WidgetConfig) {
    this.config = config;
  }

  // Create box opening widget
  createBoxOpeningWidget(containerId: string, options?: { compact?: boolean; maxBoxes?: number }) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    // Dynamically import and render BoxOpeningWidget
    import('./BoxOpeningWidget').then(({ BoxOpeningWidget }) => {
      const widget = React.createElement(BoxOpeningWidget, {
        ...this.config,
        ...options,
        onBoxOpened: (result: any) => {
          // Emit custom event for partner integration
          window.dispatchEvent(new CustomEvent('rollingdrop:boxOpened', { detail: result }));
        },
        onError: (error: string) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:error', { detail: { error } }));
        }
      });

      // Render using ReactDOM (would need to be imported)
      // ReactDOM.render(widget, container);
    });
  }

  // Create inventory widget
  createInventoryWidget(containerId: string, options?: { compact?: boolean; showActions?: boolean }) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    import('./InventoryWidget').then(({ InventoryWidget }) => {
      const widget = React.createElement(InventoryWidget, {
        ...this.config,
        ...options,
        onItemAction: (action: string, item: any) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:itemAction', { 
            detail: { action, item } 
          }));
        },
        onError: (error: string) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:error', { detail: { error } }));
        }
      });
    });
  }

  // Create marketplace widget
  createMarketplaceWidget(containerId: string, options?: { compact?: boolean; showSearch?: boolean }) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    import('./MarketplaceWidget').then(({ MarketplaceWidget }) => {
      const widget = React.createElement(MarketplaceWidget, {
        ...this.config,
        ...options,
        onPurchase: (item: any, price: number) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:purchase', { 
            detail: { item, price } 
          }));
        },
        onError: (error: string) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:error', { detail: { error } }));
        }
      });
    });
  }

  // Create battles widget
  createBattlesWidget(containerId: string, options?: { compact?: boolean }) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    import('./BattlesWidget').then(({ BattlesWidget }) => {
      const widget = React.createElement(BattlesWidget, {
        ...this.config,
        ...options,
        onJoinBattle: (battleId: number) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:battleJoined', { 
            detail: { battleId } 
          }));
        },
        onCreateBattle: () => {
          window.dispatchEvent(new CustomEvent('rollingdrop:battleCreateRequested'));
        },
        onError: (error: string) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:error', { detail: { error } }));
        }
      });
    });
  }

  // Create stats widget
  createStatsWidget(containerId: string, options?: { compact?: boolean }) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    import('./StatsWidget').then(({ StatsWidget }) => {
      const widget = React.createElement(StatsWidget, {
        ...this.config,
        ...options,
        onError: (error: string) => {
          window.dispatchEvent(new CustomEvent('rollingdrop:error', { detail: { error } }));
        }
      });
    });
  }

  // Update global config
  updateConfig(newConfig: Partial<WidgetConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global widget instance for easy access
declare global {
  interface Window {
    RollingDropWidgets: typeof RollingDropWidgets;
    rollingDropInstance?: RollingDropWidgets;
  }
}

// Export for CDN distribution
if (typeof window !== 'undefined') {
  window.RollingDropWidgets = RollingDropWidgets;
}