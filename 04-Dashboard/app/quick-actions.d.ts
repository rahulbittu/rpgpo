export interface QuickAction {
    id: string;
    label: string;
    description: string;
    category: 'research' | 'ops' | 'report' | 'maintenance';
    endpoint: string;
    method: 'GET' | 'POST';
    body?: Record<string, unknown>;
}
export declare function getQuickActions(): QuickAction[];
//# sourceMappingURL=quick-actions.d.ts.map