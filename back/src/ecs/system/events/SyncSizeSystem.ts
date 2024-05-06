import Rapier from "../../../physics/rapier.js";
import { SizeComponent } from "../../../../../shared/component/SizeComponent.js";
import { Entity } from "../../../../../shared/entity/Entity.js";
import { PhysicsColliderComponent } from "../../component/PhysicsColliderComponent.js";
import { EventSingleSizeComponent } from "../../component/events/EventSingleSizeComponent.js";
import { SingleSizeComponent } from "../../../../../shared/component/SingleSizeComponent.js";
import { EventSizeComponent } from "../../component/events/EventSizeComponent.js";
import { SerializedEntityType } from "../../../../../shared/network/server/serialized.js";

export class SyncSizeSystem {
  update(entities: Entity[]) {
    for (const entity of entities) {
      const colliderComponent = entity.getComponent(PhysicsColliderComponent);
      if (!colliderComponent) continue;

      const sizeComponent = entity.getComponent(SizeComponent);
      const eventSizeComponent = entity.getComponent(EventSizeComponent);

      if (eventSizeComponent && sizeComponent) {
        // TODO: Check for cube here like the sphere
        const { width, height, depth } = eventSizeComponent;
        sizeComponent.width = width;
        sizeComponent.height = height;
        sizeComponent.depth = depth;

        let colliderDesc = Rapier.ColliderDesc.cuboid(width, height, depth);
        colliderComponent.collider.setShape(colliderDesc.shape);

        // This will rebroadcast the update to all clients.
        sizeComponent.updated = true;
        entity.removeComponent(EventSizeComponent);
      }

      const singleSizeComponent = entity.getComponent(SingleSizeComponent);
      const eventSingleSizeComponent = entity.getComponent(
        EventSingleSizeComponent
      );

      if (singleSizeComponent && eventSingleSizeComponent) {
        if (entity.type === SerializedEntityType.SPHERE) {
          const { size } = eventSingleSizeComponent;
          singleSizeComponent.size = size;

          let colliderDesc = Rapier.ColliderDesc.ball(size);
          colliderComponent.collider.setShape(colliderDesc.shape);

          // This will rebroadcast the update to all clients.
          singleSizeComponent.updated = true;
          entity.removeComponent(EventSingleSizeComponent);
        }
      }
    }
  }
}
