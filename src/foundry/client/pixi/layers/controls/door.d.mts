import type { FixedInstanceType, Identity } from "#utils";

declare global {
  /**
   * An icon representing a Door Control
   */
  class DoorControl extends PIXI.Container {
    constructor(wall: Wall.Implementation);

    wall: Wall.Implementation;

    /**
     * @defaultValue `false`
     * @remarks "Door controls are not visible by default"
     */
    override visible: boolean;

    /**
     * The center of the wall which contains the door.
     */
    get center(): PIXI.Point;

    /**
     * Draw the DoorControl icon, displaying its icon texture and border
     */
    draw(): Promise<this>;

    /** @remarks Not initialized or even defined until set in {@link DoorControl#draw} */
    bg?: PIXI.Graphics;

    /** @remarks Not initialized or even defined until set in {@link DoorControl#draw} */
    icon?: PIXI.Sprite;

    /** @remarks Not initialized or even defined until set in {@link DoorControl#draw} */
    border?: PIXI.Graphics;

    /**
     * Get the icon texture to use for the Door Control icon based on the door state
     */
    protected _getTexture(): foundry.canvas.loadTexture.Return;

    reposition(): void;

    /**
     * Determine whether the DoorControl is visible to the calling user's perspective.
     * The control is always visible if the user is a GM and no Tokens are controlled.
     * @see {@link CanvasVisibility.testVisibility | `CanvasVisibility#testVisibility`}
     */
    get isVisible(): boolean;

    /**
     * Handle mouse over events on a door control icon.
     * @param event - The originating interaction event
     */
    protected _onMouseOver(event: PIXI.FederatedEvent): false | void;

    /**
     * Handle mouse out events on a door control icon.
     * @param event - The originating interaction event
     */
    protected _onMouseOut(event: PIXI.FederatedEvent): false | void;

    /**
     * Handle left mouse down events on a door control icon.
     * This should only toggle between the OPEN and CLOSED states.
     * @param event - The originating interaction event
     */
    protected _onMouseDown(event: PIXI.FederatedEvent): false | void | Promise<WallDocument.Implementation>;

    /**
     * Handle right mouse down events on the door control icon
     * This should toggle whether the door is LOCKED or CLOSED
     * @param event - The originating interaction event
     */
    protected _onRightDown(event: PIXI.FederatedEvent): void | Promise<WallDocument.Implementation>;
  }

  namespace DoorControl {
    interface Any extends AnyDoorControl {}
    interface AnyConstructor extends Identity<typeof AnyDoorControl> {}

    type ConfiguredClass = CONFIG["Canvas"]["doorControlClass"];
    type ConfiguredInstance = FixedInstanceType<ConfiguredClass>;
  }
}

declare abstract class AnyDoorControl extends DoorControl {
  constructor(...args: never);
}
