---
id: metrics-migration
title: Metrics migration guide
sidebar_label: Metrics migration
sidebar_position: 3
description: Migrating metrics names.
keywords: [Tracing, metrics, cardano-tracer, trace-dispatch, new tracing system, monitoring, cardano node]
---

- [Migrating metrics names](#migrating-metrics-names)
  - [Full suffixes variant](#full-suffixes-variant)
    - [Renamed metrics](#renamed-metrics)
    - [Removed metrics](#removed-metrics)
    - [Added metrics](#added-metrics)
  - [No suffix variant](#no-suffix-variant)
    - [Renamed metrics](#renamed-metrics-1)
    - [Removed metrics](#removed-metrics-1)
    - [Added metrics](#added-metrics-1)


## Migrating metrics names

This is a comprehensive migration guide for metrics names. When switching from legacy to new tracing, the following changes in metrics names have to be accounted for in all places where metrics are processed.

Within the new system, the names are stable; thus, migrating them is a one-time effort.

### Full suffixes variant

In the legacy system, the metrics naming schema isn't fully consistent wrt. name suffixes. Hence, the new system includes several name changes to improve that, as well as be more compliant with existing standards.

This is what the migration looks like when scraping from `cardano-tracer`, or from the Node's `PrometheusSimple` backend with the `suffix` switch (default).

#### Renamed metrics

The following metrics have been **renamed**:

```
cardano_node_metrics_Forge_adopted_int                                               -->  cardano_node_metrics_Forge_adopted_counter
cardano_node_metrics_Forge_forge_about_to_lead_int                                   -->  cardano_node_metrics_Forge_about_to_lead_counter
cardano_node_metrics_Forge_forged_int                                                -->  cardano_node_metrics_Forge_forged_counter
cardano_node_metrics_Forge_node_is_leader_int                                        -->  cardano_node_metrics_Forge_node_is_leader_counter
cardano_node_metrics_Forge_node_not_leader_int                                       -->  cardano_node_metrics_Forge_node_not_leader_counter
cardano_node_metrics_Stat_threads_int                                                -->  cardano_node_metrics_RTS_threads_int
cardano_node_metrics_blockfetchclient_blockdelay_cdfFive                             -->  cardano_node_metrics_blockfetchclient_blockdelay_cdfFive_real
cardano_node_metrics_blockfetchclient_blockdelay_cdfOne                              -->  cardano_node_metrics_blockfetchclient_blockdelay_cdfOne_real
cardano_node_metrics_blockfetchclient_blockdelay_cdfThree                            -->  cardano_node_metrics_blockfetchclient_blockdelay_cdfThree_real
cardano_node_metrics_blockfetchclient_blockdelay_s                                   -->  cardano_node_metrics_blockfetchclient_blockdelay_real
cardano_node_metrics_blockfetchclient_blocksize                                      -->  cardano_node_metrics_blockfetchclient_blocksize_int
cardano_node_metrics_blockfetchclient_lateblocks                                     -->  cardano_node_metrics_blockfetchclient_lateblocks_counter
cardano_node_metrics_blocksForgedNum_int                                             -->  cardano_node_metrics_blocksForged_int
cardano_node_metrics_connectionManager_duplexConns                                   -->  cardano_node_metrics_connectionManager_duplexConns_int
cardano_node_metrics_connectionManager_fullDuplexConns                               -->  cardano_node_metrics_connectionManager_fullDuplexConns_int
cardano_node_metrics_connectionManager_incomingConns                                 -->  cardano_node_metrics_connectionManager_inboundConns_int
cardano_node_metrics_connectionManager_outgoingConns                                 -->  cardano_node_metrics_connectionManager_outboundConns_int
cardano_node_metrics_connectionManager_unidirectionalConns                           -->  cardano_node_metrics_connectionManager_unidirectionalConns_int
cardano_node_metrics_forging_enabled                                                 -->  cardano_node_metrics_forging_enabled_int
cardano_node_metrics_forks_int                                                       -->  cardano_node_metrics_forks_counter
cardano_node_metrics_inboundGovernor_cold                                            -->  cardano_node_metrics_inboundGovernor_cold_int
cardano_node_metrics_inboundGovernor_hot                                             -->  cardano_node_metrics_inboundGovernor_hot_int
cardano_node_metrics_inboundGovernor_idle                                            -->  cardano_node_metrics_inboundGovernor_idle_int
cardano_node_metrics_inboundGovernor_warm                                            -->  cardano_node_metrics_inboundGovernor_warm_int
cardano_node_metrics_nodeIsLeaderNum_int                                             -->  cardano_node_metrics_nodeIsLeader_int
cardano_node_metrics_nodeStartTime_int                                               -->  cardano_node_metrics_node_start_time_int
cardano_node_metrics_peerSelection_ActiveBigLedgerPeers                              -->  cardano_node_metrics_peerSelection_ActiveBigLedgerPeers_int
cardano_node_metrics_peerSelection_ActiveBigLedgerPeersDemotions                     -->  cardano_node_metrics_peerSelection_ActiveBigLedgerPeersDemotions_int
cardano_node_metrics_peerSelection_ActiveBootstrapPeers                              -->  cardano_node_metrics_peerSelection_ActiveBootstrapPeers_int
cardano_node_metrics_peerSelection_ActiveBootstrapPeersDemotions                     -->  cardano_node_metrics_peerSelection_ActiveBootstrapPeersDemotions_int
cardano_node_metrics_peerSelection_ActiveLocalRootPeers                              -->  cardano_node_metrics_peerSelection_ActiveLocalRootPeers_int
cardano_node_metrics_peerSelection_ActiveLocalRootPeersDemotions                     -->  cardano_node_metrics_peerSelection_ActiveLocalRootPeersDemotions_int
cardano_node_metrics_peerSelection_ActiveNonRootPeers                                -->  cardano_node_metrics_peerSelection_ActiveNonRootPeers_int
cardano_node_metrics_peerSelection_ActiveNonRootPeersDemotions                       -->  cardano_node_metrics_peerSelection_ActiveNonRootPeersDemotions_int
cardano_node_metrics_peerSelection_ActivePeers                                       -->  cardano_node_metrics_peerSelection_ActivePeers_int
cardano_node_metrics_peerSelection_ActivePeersDemotions                              -->  cardano_node_metrics_peerSelection_ActivePeersDemotions_int
cardano_node_metrics_peerSelection_ColdBigLedgerPeersPromotions                      -->  cardano_node_metrics_peerSelection_ColdBigLedgerPeersPromotions_int
cardano_node_metrics_peerSelection_ColdBootstrapPeersPromotions                      -->  cardano_node_metrics_peerSelection_ColdBootstrapPeersPromotions_int
cardano_node_metrics_peerSelection_ColdNonRootPeersPromotions                        -->  cardano_node_metrics_peerSelection_ColdNonRootPeersPromotions_int
cardano_node_metrics_peerSelection_ColdPeersPromotions                               -->  cardano_node_metrics_peerSelection_ColdPeersPromotions_int
cardano_node_metrics_peerSelection_EstablishedBigLedgerPeers                         -->  cardano_node_metrics_peerSelection_EstablishedBigLedgerPeers_int
cardano_node_metrics_peerSelection_EstablishedBootstrapPeers                         -->  cardano_node_metrics_peerSelection_EstablishedBootstrapPeers_int
cardano_node_metrics_peerSelection_EstablishedLocalRootPeers                         -->  cardano_node_metrics_peerSelection_EstablishedLocalRootPeers_int
cardano_node_metrics_peerSelection_EstablishedNonRootPeers                           -->  cardano_node_metrics_peerSelection_EstablishedNonRootPeers_int
cardano_node_metrics_peerSelection_EstablishedPeers                                  -->  cardano_node_metrics_peerSelection_EstablishedPeers_int
cardano_node_metrics_peerSelection_KnownBigLedgerPeers                               -->  cardano_node_metrics_peerSelection_KnownBigLedgerPeers_int
cardano_node_metrics_peerSelection_KnownBootstrapPeers                               -->  cardano_node_metrics_peerSelection_KnownBootstrapPeers_int
cardano_node_metrics_peerSelection_KnownLocalRootPeers                               -->  cardano_node_metrics_peerSelection_KnownLocalRootPeers_int
cardano_node_metrics_peerSelection_KnownNonRootPeers                                 -->  cardano_node_metrics_peerSelection_KnownNonRootPeers_int
cardano_node_metrics_peerSelection_KnownPeers                                        -->  cardano_node_metrics_peerSelection_KnownPeers_int
cardano_node_metrics_peerSelection_RootPeers                                         -->  cardano_node_metrics_peerSelection_RootPeers_int
cardano_node_metrics_peerSelection_WarmBigLedgerPeersDemotions                       -->  cardano_node_metrics_peerSelection_WarmBigLedgerPeersDemotions_int
cardano_node_metrics_peerSelection_WarmBigLedgerPeersPromotions                      -->  cardano_node_metrics_peerSelection_WarmBigLedgerPeersPromotions_int
cardano_node_metrics_peerSelection_WarmBootstrapPeersDemotions                       -->  cardano_node_metrics_peerSelection_WarmBootstrapPeersDemotions_int
cardano_node_metrics_peerSelection_WarmBootstrapPeersPromotions                      -->  cardano_node_metrics_peerSelection_WarmBootstrapPeersPromotions_int
cardano_node_metrics_peerSelection_WarmLocalRootPeersPromotions                      -->  cardano_node_metrics_peerSelection_WarmLocalRootPeersPromotions_int
cardano_node_metrics_peerSelection_WarmNonRootPeersDemotions                         -->  cardano_node_metrics_peerSelection_WarmNonRootPeersDemotions_int
cardano_node_metrics_peerSelection_WarmNonRootPeersPromotions                        -->  cardano_node_metrics_peerSelection_WarmNonRootPeersPromotions_int
cardano_node_metrics_peerSelection_WarmPeersDemotions                                -->  cardano_node_metrics_peerSelection_WarmPeersDemotions_int
cardano_node_metrics_peerSelection_WarmPeersPromotions                               -->  cardano_node_metrics_peerSelection_WarmPeersPromotions_int
cardano_node_metrics_peerSelection_churn_DecreasedActiveBigLedgerPeers               -->  cardano_node_metrics_peerSelection_churn_DecreasedActiveBigLedgerPeers_int
cardano_node_metrics_peerSelection_churn_DecreasedActiveBigLedgerPeers_duration      -->  cardano_node_metrics_peerSelection_churnDecreasedActiveBigLedgerPeers_duration_real
cardano_node_metrics_peerSelection_churn_DecreasedActivePeers                        -->  cardano_node_metrics_peerSelection_churn_DecreasedActivePeers_int
cardano_node_metrics_peerSelection_churn_DecreasedActivePeers_duration               -->  cardano_node_metrics_peerSelection_churnDecreasedActivePeers_duration_real
cardano_node_metrics_peerSelection_churn_DecreasedEstablishedBigLedgerPeers          -->  cardano_node_metrics_peerSelection_churn_DecreasedEstablishedBigLedgerPeers_int
cardano_node_metrics_peerSelection_churn_DecreasedEstablishedBigLedgerPeers_duration -->  cardano_node_metrics_peerSelection_churnDecreasedEstablishedBigLedgerPeers_duration_real
cardano_node_metrics_peerSelection_churn_DecreasedEstablishedPeers                   -->  cardano_node_metrics_peerSelection_churn_DecreasedEstablishedPeers_int
cardano_node_metrics_peerSelection_churn_DecreasedEstablishedPeers_duration          -->  cardano_node_metrics_peerSelection_churnDecreasedEstablishedPeers_duration_real
cardano_node_metrics_peerSelection_churn_DecreasedKnownBigLedgerPeers                -->  cardano_node_metrics_peerSelection_churn_DecreasedKnownBigLedgerPeers_int
cardano_node_metrics_peerSelection_churn_DecreasedKnownBigLedgerPeers_duration       -->  cardano_node_metrics_peerSelection_churnDecreasedKnownBigLedgerPeers_duration_real
cardano_node_metrics_peerSelection_churn_DecreasedKnownPeers                         -->  cardano_node_metrics_peerSelection_churn_DecreasedKnownPeers_int
cardano_node_metrics_peerSelection_churn_DecreasedKnownPeers_duration                -->  cardano_node_metrics_peerSelection_churnDecreasedKnownPeers_duration_real
cardano_node_metrics_peerSelection_churn_IncreasedActiveBigLedgerPeers               -->  cardano_node_metrics_peerSelection_churn_IncreasedActiveBigLedgerPeers_int
cardano_node_metrics_peerSelection_churn_IncreasedActivePeers                        -->  cardano_node_metrics_peerSelection_churn_IncreasedActivePeers_int
cardano_node_metrics_peerSelection_churn_IncreasedEstablishedBigLedgerPeers          -->  cardano_node_metrics_peerSelection_churn_IncreasedEstablishedBigLedgerPeers_int
cardano_node_metrics_peerSelection_churn_IncreasedEstablishedPeers                   -->  cardano_node_metrics_peerSelection_churn_IncreasedEstablishedPeers_int
cardano_node_metrics_peerSelection_churn_IncreasedKnownBigLedgerPeers                -->  cardano_node_metrics_peerSelection_churn_IncreasedKnownBigLedgerPeers_int
cardano_node_metrics_peerSelection_churn_IncreasedKnownPeers                         -->  cardano_node_metrics_peerSelection_churn_IncreasedKnownPeers_int
cardano_node_metrics_peerSelection_cold                                              -->  cardano_node_metrics_peerSelection_Cold_int
cardano_node_metrics_peerSelection_coldBigLedgerPeers                                -->  cardano_node_metrics_peerSelection_ColdBigLedgerPeers_int
cardano_node_metrics_peerSelection_hot                                               -->  cardano_node_metrics_peerSelection_Hot_int
cardano_node_metrics_peerSelection_hotBigLedgerPeers                                 -->  cardano_node_metrics_peerSelection_HotBigLedgerPeers_int
cardano_node_metrics_peerSelection_warm                                              -->  cardano_node_metrics_peerSelection_Warm_int
cardano_node_metrics_peerSelection_warmBigLedgerPeers                                -->  cardano_node_metrics_peerSelection_WarmBigLedgerPeers_int
cardano_node_metrics_served_block_count_int                                          -->  cardano_node_metrics_served_block_counter
cardano_node_metrics_served_block_latest_count_int                                   -->  cardano_node_metrics_served_block_latest_int
cardano_node_metrics_served_header_counter_int                                       -->  cardano_node_metrics_served_header_counter
cardano_node_metrics_txsProcessedNum_int                                             -->  cardano_node_metrics_txsProcessedNum_counter
```

#### Removed metrics

The following metrics have been **removed**:

```
ekg_server_timestamp_ms
```

#### Added metrics

The following metrics have been **added**:

```
cardano_node_metrics_ChainSync_HeadersServed_counter
cardano_node_metrics_GSM_state_int
cardano_node_metrics_RTS_alloc_int
cardano_node_metrics_Stat_blkIOticks_int
cardano_node_metrics_Stat_fsRd_int
cardano_node_metrics_Stat_fsWr_int
cardano_node_metrics_Stat_netRd_int
cardano_node_metrics_Stat_netWr_int
cardano_node_metrics_basicInfo
cardano_node_metrics_blockReplayProgress_real
cardano_node_metrics_cardano_version_major_int
cardano_node_metrics_cardano_version_minor_int
cardano_node_metrics_cardano_version_patch_int
cardano_node_metrics_forgedSlotLast_int
cardano_node_metrics_haskell_compiler_major_int
cardano_node_metrics_haskell_compiler_minor_int
cardano_node_metrics_haskell_compiler_patch_int
cardano_node_metrics_localInboundGovernor_cold_int
cardano_node_metrics_localInboundGovernor_hot_int
cardano_node_metrics_localInboundGovernor_idle_int
cardano_node_metrics_localInboundGovernor_warm_int
cardano_node_metrics_nodeCannotForge_int
cardano_node_metrics_peerSelection_HotLocalRoots_int
cardano_node_metrics_peerSelection_WarmLocalRoots_int
cardano_node_metrics_peersFromNodeKernel_int
cardano_node_metrics_slotsMissed_int
cardano_node_metrics_submissions_accepted_counter
cardano_node_metrics_submissions_rejected_counter
cardano_node_metrics_submissions_submitted_counter
cardano_node_metrics_tipBlock
```

### No suffix variant

For those who prefer a simpler migration and do not require suffixes, the Node's `PrometheusSimple` backend allows for dropping them with the `nosuffix` switch.

This is what the migration looks like in that case.

#### Renamed metrics

The following metrics have been **renamed**:

```
cardano_node_metrics_Forge_adopted_int                                               -->  cardano_node_metrics_Forge_adopted
cardano_node_metrics_Forge_forge_about_to_lead_int                                   -->  cardano_node_metrics_Forge_about_to_lead
cardano_node_metrics_Forge_forged_int                                                -->  cardano_node_metrics_Forge_forged
cardano_node_metrics_Forge_node_is_leader_int                                        -->  cardano_node_metrics_Forge_node_is_leader
cardano_node_metrics_Forge_node_not_leader_int                                       -->  cardano_node_metrics_Forge_node_not_leader
cardano_node_metrics_Mem_resident_int                                                -->  cardano_node_metrics_Mem_resident
cardano_node_metrics_RTS_gcHeapBytes_int                                             -->  cardano_node_metrics_RTS_gcHeapBytes
cardano_node_metrics_RTS_gcLiveBytes_int                                             -->  cardano_node_metrics_RTS_gcLiveBytes
cardano_node_metrics_RTS_gcMajorNum_int                                              -->  cardano_node_metrics_RTS_gcMajorNum
cardano_node_metrics_RTS_gcMinorNum_int                                              -->  cardano_node_metrics_RTS_gcMinorNum
cardano_node_metrics_RTS_gcticks_int                                                 -->  cardano_node_metrics_RTS_gcticks
cardano_node_metrics_RTS_mutticks_int                                                -->  cardano_node_metrics_RTS_mutticks
cardano_node_metrics_Stat_cputicks_int                                               -->  cardano_node_metrics_Stat_cputicks
cardano_node_metrics_Stat_threads_int                                                -->  cardano_node_metrics_RTS_threads
cardano_node_metrics_blockNum_int                                                    -->  cardano_node_metrics_blockNum
cardano_node_metrics_blockfetchclient_blockdelay_s                                   -->  cardano_node_metrics_blockfetchclient_blockdelay
cardano_node_metrics_blocksForgedNum_int                                             -->  cardano_node_metrics_blocksForged
cardano_node_metrics_connectionManager_incomingConns                                 -->  cardano_node_metrics_connectionManager_inboundConns
cardano_node_metrics_connectionManager_outgoingConns                                 -->  cardano_node_metrics_connectionManager_outboundConns
cardano_node_metrics_currentKESPeriod_int                                            -->  cardano_node_metrics_currentKESPeriod
cardano_node_metrics_delegMapSize_int                                                -->  cardano_node_metrics_delegMapSize
cardano_node_metrics_density_real                                                    -->  cardano_node_metrics_density
cardano_node_metrics_epoch_int                                                       -->  cardano_node_metrics_epoch
cardano_node_metrics_forks_int                                                       -->  cardano_node_metrics_forks
cardano_node_metrics_mempoolBytes_int                                                -->  cardano_node_metrics_mempoolBytes
cardano_node_metrics_nodeIsLeaderNum_int                                             -->  cardano_node_metrics_nodeIsLeader
cardano_node_metrics_nodeStartTime_int                                               -->  cardano_node_metrics_node_start_time
cardano_node_metrics_operationalCertificateExpiryKESPeriod_int                       -->  cardano_node_metrics_operationalCertificateExpiryKESPeriod
cardano_node_metrics_operationalCertificateStartKESPeriod_int                        -->  cardano_node_metrics_operationalCertificateStartKESPeriod
cardano_node_metrics_peerSelection_churn_DecreasedActiveBigLedgerPeers_duration      -->  cardano_node_metrics_peerSelection_churnDecreasedActiveBigLedgerPeers_duration
cardano_node_metrics_peerSelection_churn_DecreasedActivePeers_duration               -->  cardano_node_metrics_peerSelection_churnDecreasedActivePeers_duration
cardano_node_metrics_peerSelection_churn_DecreasedEstablishedBigLedgerPeers_duration -->  cardano_node_metrics_peerSelection_churnDecreasedEstablishedBigLedgerPeers_duration
cardano_node_metrics_peerSelection_churn_DecreasedEstablishedPeers_duration          -->  cardano_node_metrics_peerSelection_churnDecreasedEstablishedPeers_duration
cardano_node_metrics_peerSelection_churn_DecreasedKnownBigLedgerPeers_duration       -->  cardano_node_metrics_peerSelection_churnDecreasedKnownBigLedgerPeers_duration
cardano_node_metrics_peerSelection_churn_DecreasedKnownPeers_duration                -->  cardano_node_metrics_peerSelection_churnDecreasedKnownPeers_duration
cardano_node_metrics_peerSelection_cold                                              -->  cardano_node_metrics_peerSelection_Cold
cardano_node_metrics_peerSelection_coldBigLedgerPeers                                -->  cardano_node_metrics_peerSelection_ColdBigLedgerPeers
cardano_node_metrics_peerSelection_hot                                               -->  cardano_node_metrics_peerSelection_Hot
cardano_node_metrics_peerSelection_hotBigLedgerPeers                                 -->  cardano_node_metrics_peerSelection_HotBigLedgerPeers
cardano_node_metrics_peerSelection_warm                                              -->  cardano_node_metrics_peerSelection_Warm
cardano_node_metrics_peerSelection_warmBigLedgerPeers                                -->  cardano_node_metrics_peerSelection_WarmBigLedgerPeers
cardano_node_metrics_remainingKESPeriods_int                                         -->  cardano_node_metrics_remainingKESPeriods
cardano_node_metrics_served_block_count_int                                          -->  cardano_node_metrics_served_block
cardano_node_metrics_served_block_latest_count_int                                   -->  cardano_node_metrics_served_block_latest
cardano_node_metrics_served_header_counter_int                                       -->  cardano_node_metrics_served_header
cardano_node_metrics_slotInEpoch_int                                                 -->  cardano_node_metrics_slotInEpoch
cardano_node_metrics_slotNum_int                                                     -->  cardano_node_metrics_slotNum
cardano_node_metrics_txsInMempool_int                                                -->  cardano_node_metrics_txsInMempool
cardano_node_metrics_txsProcessedNum_int                                             -->  cardano_node_metrics_txsProcessedNum
cardano_node_metrics_txsSyncDuration_int                                             -->  cardano_node_metrics_txsSyncDuration
cardano_node_metrics_utxoSize_int                                                    -->  cardano_node_metrics_utxoSize
```

#### Removed metrics

The following metrics have been **removed**:

```
ekg_server_timestamp_ms
```

#### Added metrics

The following metrics have been **added**:

```
cardano_node_metrics_ChainSync_HeadersServed
cardano_node_metrics_GSM_state
cardano_node_metrics_RTS_alloc
cardano_node_metrics_Stat_blkIOticks
cardano_node_metrics_Stat_fsRd
cardano_node_metrics_Stat_fsWr
cardano_node_metrics_Stat_netRd
cardano_node_metrics_Stat_netWr
cardano_node_metrics_basicInfo
cardano_node_metrics_blockReplayProgress
cardano_node_metrics_cardano_version_major
cardano_node_metrics_cardano_version_minor
cardano_node_metrics_cardano_version_patch
cardano_node_metrics_forgedSlotLast
cardano_node_metrics_haskell_compiler_major
cardano_node_metrics_haskell_compiler_minor
cardano_node_metrics_haskell_compiler_patch
cardano_node_metrics_localInboundGovernor_cold
cardano_node_metrics_localInboundGovernor_hot
cardano_node_metrics_localInboundGovernor_idle
cardano_node_metrics_localInboundGovernor_warm
cardano_node_metrics_nodeCannotForge
cardano_node_metrics_peerSelection_HotLocalRoots
cardano_node_metrics_peerSelection_WarmLocalRoots
cardano_node_metrics_peersFromNodeKernel
cardano_node_metrics_slotsMissed
cardano_node_metrics_submissions_accepted
cardano_node_metrics_submissions_rejected
cardano_node_metrics_submissions_submitted
cardano_node_metrics_tipBlock
```

