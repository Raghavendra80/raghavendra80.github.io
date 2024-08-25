---
title: "Supra Containers as Appchains for Efficient Parallel Execution of Transactions"
# collection: publications
# category: conferences
permalink: /publication/containers
excerpt: 'By definition, app-chains expect isolation to efficiently serve specific use cases. Currently, Layer 2s, Avalanche’s Subnets, Polkadot’s Parachains, and Cosmos Zones are commonly used solutions to
host app-chains. We observe that in an ecosystem with a high throughput Layer 1 blockchain, it is
sufficient to offer this isolation at the application layer via namespaces. We observe that most of
the times smart contracts come bundled as they compose and call amongst this bundle. Hence, on
Supra, app-chains are offered as Supra Containers, which group smart contracts into namespaces,
disallowing atomic function calls across containers.
This container abstraction lends itself naturally to the parallel execution of transactions in
batches derived from different containers, as transactions belonging to batches of two different
containers are non-conflicting. Through experimentation, we demonstrate the performance impact
of Supra’s containerized parallel execution by comparing it against Aptos’ BlockSTM and Solana’s
SeaLevel techniques at various parameters.'
date: 2024-02-17
# venue: 'GitHub Journal of Bugs'
paperurl: 'https://supra.com/documents/Supra-Containers-Whitepaper.pdf'
# citation: 'Your Name, You. (2024). &quot;Paper Title Number 3.&quot; <i>GitHub Journal of Bugs</i>. 1(3).'
---

The contents above will be part of a list of publications, if the user clicks the link for the publication than the contents of section will be rendered as a full page, allowing you to provide more information about the paper for the reader. When publications are displayed as a single page, the contents of the above "citation" field will automatically be included below this section in a smaller font.
