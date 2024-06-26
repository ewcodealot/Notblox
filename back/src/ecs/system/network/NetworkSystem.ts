import { Packr, pack, unpack } from 'msgpackr'
import { WebSocketComponent } from '../../component/WebsocketComponent.js'
import { Entity } from '../../../../../shared/entity/Entity.js'
import { SerializedEntity } from '../../../../../shared/network/server/serialized.js'
import { NetworkDataComponent } from '../../component/NetworkDataComponent.js'
import { ServerMessageType } from '../../../../../shared/network/server/base.js'
import { WebsocketSystem } from './WebsocketSystem.js'
import { readFileSync, writeFileSync } from 'fs'

export class NetworkSystem {
  //  Serializes the given entities.
  private packr = new Packr({})
  private websocketSystem = new WebsocketSystem()
  private serialize(entities: Entity[], serializeAll: boolean): SerializedEntity[] {
    const serializedEntities: SerializedEntity[] = []

    for (const entity of entities) {
      const networkDataComponent = entity.getComponent(NetworkDataComponent)

      if (networkDataComponent) {
        const _serializedEntities = networkDataComponent.serialize(serializeAll)

        // Skip entities without any components to reduce bandwidth
        if (_serializedEntities != null) {
          serializedEntities.push(_serializedEntities)
        }
      }
    }
    return serializedEntities
  }

  // Builds a snapshot message to send to the clients.
  private buildSnapshotMessage(serializedEntities: SerializedEntity[]) {
    return this.packr.pack({
      t: ServerMessageType.SNAPSHOT,
      e: serializedEntities,
    })
  }

  // Updates the network state and sends snapshots to clients.
  update(entities: Entity[]): void {
    // Send full snapshot to newly connected clients
    let fullSnapshotMessage: Buffer | undefined
    for (const entity of entities) {
      const websocketComponent = entity.getComponent(WebSocketComponent)
      if (websocketComponent && !websocketComponent.isFirstSnapshotSent) {
        if (!fullSnapshotMessage) {
          const fullSerializedEntities = this.serialize(entities, true)
          fullSnapshotMessage = this.buildSnapshotMessage(fullSerializedEntities)
          console.log("Hasn't sent the first snapshot")
        }
        websocketComponent.ws.send(fullSnapshotMessage, true)
        websocketComponent.isFirstSnapshotSent = true
      }
    }

    // Send delta snapshots to all clients
    const serializedEntities = this.serialize(entities, false)
    const snapshotMessage = this.buildSnapshotMessage(serializedEntities)
    this.broadcast(entities, snapshotMessage)
  }

  // Broadcasts a message to all connected clients.
  private broadcast(entities: Entity[], message: any): void {
    for (const entity of entities) {
      const websocketComponent = entity.getComponent(WebSocketComponent)
      if (websocketComponent) {
        websocketComponent.ws.send(message, true)
      }
    }
  }
}
