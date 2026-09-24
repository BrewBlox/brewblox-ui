import { Block, BlockClaim, Link } from 'brewblox-proto/ts';

/**
 * Derives the claims of a service from the `claimedBy` links in its blocks.
 * Each claim is followed up the chain of claimers to the block at the top.
 *
 * The service includes the same list in its state event.
 * Patch events carry no claims, but do carry the changed blocks.
 * This is a port of `calculate_claims()` in brewblox-devcon-spark.
 */
export function calculateClaims(blocks: Block[]): BlockClaim[] {
  const blockClaims = new Map<string, BlockClaim>();
  const channelClaims: BlockClaim[] = [];

  for (const block of blocks) {
    // Claims to the entire block
    const link: Link | undefined = block.data.claimedBy;
    if (link?.id) {
      blockClaims.set(block.id, {
        source: link.id,
        target: block.id,
        intermediate: [],
      });
    }

    // On IoArrays, individual channels are claimed
    const channels: { claimedBy?: Link }[] = block.data.channels ?? [];
    for (const channel of channels) {
      if (channel.claimedBy?.id) {
        channelClaims.push({
          source: channel.claimedBy.id,
          target: block.id,
          intermediate: [],
        });
      }
    }
  }

  const extendedClaim = (claim: BlockClaim): BlockClaim => {
    const sourceClaim = blockClaims.get(claim.source);
    if (!sourceClaim) {
      return claim;
    }

    const grandSource = sourceClaim.source;
    if (claim.intermediate.includes(grandSource)) {
      return claim; // Circular claim
    }

    // Shift claim, look further up the tree
    return extendedClaim({
      source: grandSource,
      target: claim.target,
      intermediate: [...claim.intermediate, claim.source],
    });
  };

  return [...blockClaims.values(), ...channelClaims].map(extendedClaim);
}
