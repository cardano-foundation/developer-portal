use aiken/collection/list
use aiken/primitive/bytearray
use aiken_design_patterns/linked_list.{Element, Node, Root}
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Input, Output, Transaction}
use registry.{Deinit, Init, Insert, MintAction, Remove, RootState}

// #region transitions
/// Only inputs with this policy's assets can be list state. Always scan the
/// complete transaction inputs, never just the anchor named by the redeemer.
pub fn elements(tx: Transaction, policy: PolicyId) -> List<Input> {
  list.filter(tx.inputs, fn(i) { !registry.no_mint(i.output.value, policy) })
}

pub fn transition(action: MintAction, policy: PolicyId, tx: Transaction) -> Bool {
  when action is {
    Init { output_index } -> {
      let output = list.expect_at(tx.outputs, output_index)
      let (key, element) = registry.read_element(output, policy)
      expect
        key == None && element == Element {
          data: Root { data: RootState { version: 0 } },
          link: None,
        }
      output.address.payment_credential == Script(policy) && registry.only_mint(
        tx.mint,
        policy,
        registry.root_key,
        1,
      )
    }
    Insert { anchor_output, node_output } -> {
      expect [anchor] = elements(tx, policy)
      let continued = list.expect_at(tx.outputs, anchor_output)
      let node = list.expect_at(tx.outputs, node_output)
      let (anchor_key, old) = registry.read_element(anchor.output, policy)
      let (continued_key, next) = registry.read_element(continued, policy)
      let (new_key, new) = registry.read_element(node, policy)
      expect Some(key) = new_key
      expect Node { .. } = new.data
      expect anchor.output.address.payment_credential == Script(policy)
      and {
        continued.address == anchor.output.address,
        node.address.payment_credential == anchor.output.address.payment_credential,
        continued_key == anchor_key,
        next.data == old.data,
        next.link == Some(key),
        new.link == old.link,
        registry.between(anchor_key, key, old.link),
        assets.lovelace_of(continued.value) >= assets.lovelace_of(
          anchor.output.value,
        ),
        registry.only_mint(
          tx.mint,
          policy,
          bytearray.concat(registry.node_prefix, key),
          1,
        ),
      }
    }
    Remove { anchor_ref, anchor_output } -> {
      expect [first, second] = elements(tx, policy)
      let (anchor, removed) = if first.output_reference == anchor_ref {
        (first, second)
      } else {
        expect second.output_reference == anchor_ref
        (second, first)
      }
      let continued = list.expect_at(tx.outputs, anchor_output)
      let (anchor_key, old) = registry.read_element(anchor.output, policy)
      let (removed_key, node) = registry.read_element(removed.output, policy)
      let (continued_key, next) = registry.read_element(continued, policy)
      expect Some(key) = removed_key
      expect anchor.output.address.payment_credential == Script(policy)
      and {
        removed.output.address.payment_credential == anchor.output.address.payment_credential,
        continued.address == anchor.output.address,
        continued_key == anchor_key,
        next.data == old.data,
        old.link == Some(key),
        next.link == node.link,
        assets.lovelace_of(continued.value) >= assets.lovelace_of(
          anchor.output.value,
        ),
        registry.only_mint(
          tx.mint,
          policy,
          bytearray.concat(registry.node_prefix, key),
          -1,
        ),
      }
    }
    Deinit -> {
      expect [root] = elements(tx, policy)
      let (key, element) = registry.read_element(root.output, policy)
      key == None && element.link == None && root.output.address.payment_credential == Script(
        policy,
      ) && registry.only_mint(tx.mint, policy, registry.root_key, -1)
    }
  }
}
// #endregion transitions
