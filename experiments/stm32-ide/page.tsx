import type { Metadata } from 'next';
import { STM32IDEMonitor } from './components/STM32IDEMonitor';
import './stm32-ide.css';

export const metadata: Metadata = {
  title: 'STM32 IDE | BattleWithBytes',
  description: 'Browser-based C compiler and flasher for STM32 microcontrollers',
};

export default function STM32IDEPage() {
  return <STM32IDEMonitor />;
}
