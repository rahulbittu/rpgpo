// Contract: UIEndToEndCheck
export interface UIEndToEndCheck {
  flow: string;
  status: 'pass' | 'partial' | 'fail';
  detail: string;
}
