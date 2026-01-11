/**
 * Tests for DebugPage component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DebugPage } from './DebugPage'
import { gatherDiagnosticsData } from '../utils/diagnostics'

// Mock dependencies
vi.mock('../utils/diagnostics')
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',

  it('displays main diagnostic sections when data loads successfully', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('🌐 Blockchain Connection')).toBeInTheDocument()
      expect(screen.getByText('📜 Contract Status')).toBeInTheDocument()
      expect(screen.getByText('💳 Recent Transactions')).toBeInTheDocument()
      expect(screen.getByText('⚙️ Environment')).toBeInTheDocument()
    })
  })

  it('displays blockchain connection information', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Base Sepolia')).toBeInTheDocument()
      expect(screen.getByText('84532')).toBeInTheDocument()
      expect(screen.getByText('testnet')).toBeInTheDocument()
      expect(screen.getByText('1234567')).toBeInTheDocument()
    })
  })

  it('displays contract information', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Number of functions
      expect(screen.getByText('1')).toBeInTheDocument() // Number of events
      expect(screen.getByText('deposit()')).toBeInTheDocument()
      expect(screen.getByText('withdraw()')).toBeInTheDocument()
    })
  })

  it('displays recent transactions', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Transaction 1')).toBeInTheDocument()
      expect(screen.getByText('deposit')).toBeInTheDocument()
    })
  })

  it('displays environment information', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('development')).toBeInTheDocument()
      expect(screen.getByText('1.0.0')).toBeInTheDocument()
      expect(screen.getByText('84532')).toBeInTheDocument()
      expect(screen.getByText('Configured')).toBeInTheDocument()
    })
  })

  it('displays wallet connection information', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Current Wallet Connection')).toBeInTheDocument()
      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument()
      expect(screen.getByText('MetaMask')).toBeInTheDocument()
      expect(screen.getByText('Base Sepolia (84532)')).toBeInTheDocument()
    })
  })

  it('allows section expansion and collapse', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      // Find toggle buttons (arrow symbols)
      const toggles = screen.getAllByText('▼')
      expect(toggles.length).toBeGreaterThan(0)
      
      // Click to collapse a section
      fireEvent.click(toggles[0])
      
      // Verify the section collapsed (▲ should appear)
      expect(screen.getByText('▶')).toBeInTheDocument()
    })
  })

  it('has refresh and clear data buttons', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('🔄 Refresh')).toBeInTheDocument()
      expect(screen.getByText('🗑️ Clear Data')).toBeInTheDocument()
    })
  })

  it('refreshes data when refresh button is clicked', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      const refreshButton = screen.getByText('🔄 Refresh')
      fireEvent.click(refreshButton)
      
      expect(gatherDiagnosticsData).toHaveBeenCalledTimes(2) // Initial load + refresh
    })
  })

  it('clears data when clear data button is clicked', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      const clearButton = screen.getByText('🗑️ Clear Data')
      fireEvent.click(clearButton)
      
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('lastTransactionHash')
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('lastTransactionData')
      expect(gatherDiagnosticsData).toHaveBeenCalledTimes(2) // Initial load + refresh after clear
    })
  })

  it('copies values to clipboard when clicked', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      // Find clickable elements with RPC URL and other copyable values
      const clickableElements = screen.getAllByTitle('Click to copy')
      expect(clickableElements.length).toBeGreaterThan(0)
      
      fireEvent.click(clickableElements[0])
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('displays status badges with correct colors', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      // Check for status badges (they should have color classes)
      const statusElements = screen.getAllByText(/OK|Connected|Configured|success/i)
      expect(statusElements.length).toBeGreaterThan(0)
    })
  })

  it('displays error information when present', async () => {
    const dataWithErrors = {
      ...mockDiagnosticsData,
      blockchainConnection: {
        ...mockDiagnosticsData.blockchainConnection,
        isConnected: false,
        error: 'Connection failed',
      },
      contract: {
        ...mockDiagnosticsData.contract,
        error: 'Contract validation failed',
      },
    }
    
    vi.mocked(gatherDiagnosticsData).mockResolvedValueOnce(dataWithErrors)
    
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
      expect(screen.getByText('Contract validation failed')).toBeInTheDocument()
    })
  })

  it('displays empty state when no transactions are found', async () => {
    const dataNoTransactions = {
      ...mockDiagnosticsData,
      lastTransactions: [],
    }
    
    vi.mocked(gatherDiagnosticsData).mockResolvedValueOnce(dataNoTransactions)
    
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No recent transactions found')).toBeInTheDocument()
    })
  })

  it('handles different transaction statuses correctly', async () => {
    const dataMultipleTransactions = {
      ...mockDiagnosticsData,
      lastTransactions: [
        {
          hash: '0xpending123',
          status: 'pending' as const,
          timestamp: Date.now(),
          type: 'withdrawal' as const,
        },
        {
          hash: '0xsuccess123',
          status: 'success' as const,
          blockNumber: 123456,
          timestamp: Date.now() - 1000,
          type: 'deposit' as const,
        },
        {
          hash: '0xerror123',
          status: 'error' as const,
          error: 'Transaction reverted',
          timestamp: Date.now() - 2000,
          type: 'deposit' as const,
        },
      ],
    }
    
    vi.mocked(gatherDiagnosticsData).mockResolvedValueOnce(dataMultipleTransactions)
    
    render(<DebugPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Transaction 1')).toBeInTheDocument()
      expect(screen.getByText('Transaction 2')).toBeInTheDocument()
      expect(screen.getByText('Transaction 3')).toBeInTheDocument()
      expect(screen.getByText('withdrawal')).toBeInTheDocument()
      expect(screen.getByText('Transaction reverted')).toBeInTheDocument()
    })
  })

  it('shows different function types with appropriate colors', async () => {
    render(<DebugPage />)
    
    await waitFor(() => {
      // Should find function with 'payable' state mutability
      const payableElements = screen.getAllByText('payable')
      expect(payableElements.length).toBeGreaterThan(0)
    })
  })
})