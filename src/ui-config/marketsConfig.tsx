import { ChainId } from '@aave/contract-helpers';
// import {
//   AaveV2Avalanche,
//   AaveV2Ethereum,
//   AaveV2Fuji,
//   AaveV2Polygon,
//   AaveV3Arbitrum,
//   AaveV3Avalanche,
//   AaveV3Base,
//   AaveV3BaseSepolia,
//   AaveV3BNB,
//   AaveV3Celo,
//   AaveV3Ethereum,
//   AaveV3EthereumEtherFi,
//   AaveV3EthereumLido,
//   AaveV3Gnosis,
//   AaveV3InkWhitelabel,
//   AaveV3Linea,
//   AaveV3Metis,
//   AaveV3Optimism,
//   AaveV3Plasma,
//   AaveV3Polygon,
//   AaveV3Scroll,
//   AaveV3Soneium,
//   AaveV3Sonic,
//   AaveV3ZkSync,
// } from '@bgd-labs/aave-address-book';
import { ReactNode } from 'react';

// Enable for premissioned market
// import { PermissionView } from 'src/components/transactions/FlowCommons/PermissionView';
export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  market: CustomMarket;
  // the network the market operates on
  chainId: ChainId;
  enabledFeatures?: {
    liquiditySwap?: boolean;
    staking?: boolean;
    governance?: boolean;
    faucet?: boolean;
    collateralRepay?: boolean;
    incentives?: boolean;
    permissions?: boolean;
    debtSwitch?: boolean;
    withdrawAndSwitch?: boolean;
    switch?: boolean;
    limit?: boolean;
  };
  permitDisabled?: boolean; // intended to be used for testnets
  isFork?: boolean;
  permissionComponent?: ReactNode;
  subgraphUrl?: string;
  logo?: string;
  externalUrl?: string; // URL for external markets like Aptos
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    DEBT_SWITCH_ADAPTER?: string;
    WITHDRAW_SWITCH_ADAPTER?: string;
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    L2_ENCODER?: string;
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
    COLLECTOR?: string;
    V3_MIGRATOR?: string;
    GHO_TOKEN_ADDRESS?: string;
  };
};
export enum CustomMarket {
  test_sepolia_v3 = 'test_sepolia_v3',
  // proto_ubc_kernel_mainnet_v3 = 'proto_ubc_kernel_mainnet_v3',
  // // v3 test networks, all v3.0.1
  // proto_base_sepolia_v3 = 'proto_base_sepolia_v3',
  // // v3 mainnets
  // proto_mainnet_v3 = 'proto_mainnet_v3',
  // proto_optimism_v3 = 'proto_optimism_v3',
  // proto_avalanche_v3 = 'proto_avalanche_v3',
  // proto_polygon_v3 = 'proto_polygon_v3',
  // proto_arbitrum_v3 = 'proto_arbitrum_v3',
  // proto_metis_v3 = 'proto_metis_v3',
  // proto_base_v3 = 'proto_base_v3',
  // proto_gnosis_v3 = 'proto_gnosis_v3',
  // proto_bnb_v3 = 'proto_bnb_v3',
  // proto_scroll_v3 = 'proto_scroll_v3',
  // proto_lido_v3 = 'proto_lido_v3',
  // proto_zksync_v3 = 'proto_zksync_v3',
  // proto_etherfi_v3 = 'proto_etherfi_v3',
  // proto_linea_v3 = 'proto_linea_v3',
  // proto_sonic_v3 = 'proto_sonic_v3',
  // proto_celo_v3 = 'proto_celo_v3',
  // proto_soneium_v3 = 'proto_soneium_v3',
  // proto_horizon_v3 = 'proto_horizon_v3',
  // proto_aptos_v3 = 'proto_aptos_v3',
  // proto_plasma_v3 = 'proto_plasma_v3',
  // proto_ink_v3 = 'proto_ink_v3',
  // // v2
  // proto_mainnet = 'proto_mainnet',
  // proto_avalanche = 'proto_avalanche',
  // proto_fuji = 'proto_fuji',
  // proto_polygon = 'proto_polygon',

  // external
  // permissioned_market = 'permissioned_market',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.test_sepolia_v3]: {
    marketTitle: 'Sepolia UBC Testnet',
    market: CustomMarket.test_sepolia_v3,
    chainId: ChainId.sepolia, // 11155111
    v3: true,
    permitDisabled: true,
    enabledFeatures: {
      faucet: true,
      governance: false,
      staking: false,
      liquiditySwap: false,
      collateralRepay: false,
      incentives: true,
      debtSwitch: false,
      switch: false,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xFFb4991C9311ea48Dc4DFaacc23E5E2Edd28fD4b',
      LENDING_POOL: '0xa3aed0e4b813dA2eb47CD33c5b46a5D355a74F50',
      WETH_GATEWAY: '0x5d48873246b22712425e94f49a8CB606Fc9F0889',
      WALLET_BALANCE_PROVIDER: '0x8202E2Ca522c5C28684E6cE23019C48Bc839fa4D',
      // 0xF65BdDeD2FB0A454F4cDc253131bAd8C9c74eD25
      UI_POOL_DATA_PROVIDER: '0x24b3b88E84770f246dD950569c2aeedeB4932c35',
      UI_INCENTIVE_DATA_PROVIDER: '0x9c0Fb9573af9D0C862F10E764882166d90aAF2a4',
      COLLECTOR: '0xBF47C98efB6a1F2eb52454b4D0404D486Db841D4',
      FAUCET: '0x7CC720646eeaEA8a90cfEBeB311e2352266C94F1',
    },
  },

  // All other markets commented out - only showing Sepolia UBC Testnet

  // [CustomMarket.proto_ubc_kernel_mainnet_v3]: {
  //   marketTitle: 'Ethereum',
  //   market: CustomMarket.proto_ubc_kernel_mainnet_v3,
  //   chainId: ChainId.mainnet,
  //   enabledFeatures: {
  //     governance: true,
  //     staking: true,
  //     liquiditySwap: true,
  //     collateralRepay: false,
  //     incentives: true,
  //     debtSwitch: true,
  //     switch: true,
  //   },
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: AaveV2Ethereum.POOL_ADDRESSES_PROVIDER,
  //     LENDING_POOL: AaveV2Ethereum.POOL,
  //     WETH_GATEWAY: AaveV2Ethereum.WETH_GATEWAY,
  //     REPAY_WITH_COLLATERAL_ADAPTER: AaveV2Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
  //     SWAP_COLLATERAL_ADAPTER: AaveV2Ethereum.SWAP_COLLATERAL_ADAPTER,
  //     WALLET_BALANCE_PROVIDER: AaveV2Ethereum.WALLET_BALANCE_PROVIDER,
  //     UI_POOL_DATA_PROVIDER: AaveV2Ethereum.UI_POOL_DATA_PROVIDER,
  //     UI_INCENTIVE_DATA_PROVIDER: AaveV2Ethereum.UI_INCENTIVE_DATA_PROVIDER,
  //     COLLECTOR: AaveV2Ethereum.COLLECTOR,
  //     V3_MIGRATOR: AaveV2Ethereum.MIGRATION_HELPER,
  //     DEBT_SWITCH_ADAPTER: AaveV2Ethereum.DEBT_SWAP_ADAPTER,
  //   },
  // },

  // [CustomMarket.proto_mainnet_v3]: {
  //   marketTitle: 'Core',
  //   market: CustomMarket.proto_mainnet_v3,
  //   chainId: ChainId.mainnet,
  //   v3: true,
  //   enabledFeatures: {
  //     governance: true,
  //     staking: true,
  //     liquiditySwap: true,
  //     collateralRepay: true,
  //     incentives: true,
  //     withdrawAndSwitch: true,
  //     debtSwitch: true,
  //     switch: true,
  //     limit: true,
  //   },
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
  //     LENDING_POOL: AaveV3Ethereum.POOL,
  //     WETH_GATEWAY: AaveV3Ethereum.WETH_GATEWAY,
  //     REPAY_WITH_COLLATERAL_ADAPTER: AaveV3Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
  //     SWAP_COLLATERAL_ADAPTER: AaveV3Ethereum.SWAP_COLLATERAL_ADAPTER,
  //     WALLET_BALANCE_PROVIDER: AaveV3Ethereum.WALLET_BALANCE_PROVIDER,
  //     UI_POOL_DATA_PROVIDER: AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
  //     UI_INCENTIVE_DATA_PROVIDER: AaveV3Ethereum.UI_INCENTIVE_DATA_PROVIDER,
  //     COLLECTOR: AaveV3Ethereum.COLLECTOR,
  //     GHO_TOKEN_ADDRESS: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
  //     WITHDRAW_SWITCH_ADAPTER: AaveV3Ethereum.WITHDRAW_SWAP_ADAPTER,
  //     DEBT_SWITCH_ADAPTER: AaveV3Ethereum.DEBT_SWAP_ADAPTER,
  //   },
  // },
  // ... remaining markets commented out
} as const;

export const findByChainId = (chainId: ChainId) => {
  return Object.values(marketsData).find((market) => market.chainId === chainId);
};
