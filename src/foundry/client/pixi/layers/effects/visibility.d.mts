import type { HandleEmptyObject, Identity, InexactPartial, IntentionalPartial, NullishProps } from "#utils";
import type { Canvas } from "#client/canvas/_module.mjs";
import type { VisibilityFilter } from "#client/canvas/rendering/filters/_module.mjs";

declare module "#configuration" {
  namespace Hooks {
    interface CanvasGroupConfig {
      CanvasVisibility: CanvasVisibility.Any;
    }
  }
}

declare global {
  /**
   * The visibility Layer which implements dynamic vision, lighting, and fog of war
   * This layer uses an event-driven workflow to perform the minimal required calculation in response to changes.
   * @see {@linkcode PointSource}
   */
  class CanvasVisibility<
    DrawOptions extends CanvasVisibility.DrawOptions = CanvasVisibility.DrawOptions,
    TearDownOptions extends CanvasVisibility.TearDownOptions = CanvasVisibility.TearDownOptions,
  > extends CanvasGroupMixin<typeof PIXI.Container, "visibility">(PIXI.Container)<DrawOptions, TearDownOptions> {
    /**
     * The currently revealed vision.
     * @remarks Only `undefined` prior to first draw
     */
    vision: CanvasVisionMask.CanvasVisionContainer | undefined;

    /**
     * The exploration container which tracks exploration progress.
     * @remarks Only `undefined` prior to first draw
     */
    explored: PIXI.Container | undefined;

    /**
     * The optional visibility overlay sprite that should be drawn instead of the unexplored color in the fog of war.
     */
    visibilityOverlay: PIXI.Sprite | undefined;

    /** @remarks Doesn't exist until it's set on draw */
    filter?: VisibilityFilter.Implementation;

    /**
     * The active vision source data object
     * @defaultValue
     * ```js
     * {
     *    source: undefined,
     *    activeLightingOptions: {}
     * }
     * ```
     */
    visionModeData: CanvasVisibility.VisionModeData;

    /**
     * Define whether each lighting layer is enabled, required, or disabled by this vision mode.
     * The value for each lighting channel is a number in LIGHTING_VISIBILITY
     * ```js
     * {
     *   background: VisionMode.LIGHTING_VISIBILITY.ENABLED,
     *    illumination: VisionMode.LIGHTING_VISIBILITY.ENABLED,
     *    coloration: VisionMode.LIGHTING_VISIBILITY.ENABLED,
     *    darkness: VisionMode.LIGHTING_VISIBILITY.ENABLED,
     *    any: true
     * }
     * ```
     */
    lightingVisibility: CanvasVisibility.LightingVisibility;

    /**
     * A status flag for whether the layer initialization workflow has succeeded.
     */
    get initialized(): boolean;

    /**
     * Indicates whether containment filtering is required when rendering vision into a texture
     * @remarks Foundry marked `@internal`
     */
    get needsContainment(): boolean;

    /**
     * Does the currently viewed Scene support Token field of vision?
     */
    get tokenVision(): Scene.Implementation["tokenVision"];

    /**
     * The configured options used for the saved fog-of-war texture.
     * @remarks Only `undefined` before first `#draw()`
     */
    get textureConfiguration(): CanvasVisibility.TextureConfiguration | undefined;

    /**
     * Optional overrides for exploration sprite dimensions.
     *
     * @privateRemarks Foundry types this parameter as `FogTextureConfiguration` in v12.331 which is plainly wrong even if it didn't not exist
     * v13.335 types as `PIXI.Rectangle | undefined`, but only x/y/width/height are ever accessed, and only then if this has been set to something
     * other than `undefined`, and in fact nothing in core ever does.
     */
    set explorationRect(rect: Canvas.Rectangle | undefined);

    /** @remarks This getter doesn't actually exist, it's only here to correct the type inferred from the setter */
    get explorationRect(): undefined;

    /**
     * Initialize all Token vision sources which are present on this layer
     */
    initializeSources(): void;

    /**
     * Initialize the vision mode.
     */
    initializeVisionMode(): void;

    protected override _draw(options?: HandleEmptyObject<DrawOptions>): Promise<void>;

    protected override _tearDown(options: HandleEmptyObject<TearDownOptions>): Promise<void>;

    /**
     * Update the display of the sight layer.
     * Organize sources into rendering queues and draw lighting containers for each source
     */
    refresh(): void;

    /**
     * Update vision (and fog if necessary)
     */
    refreshVisibility(): void;

    /**
     * Reset the exploration container with the fog sprite
     */
    resetExploration(): void;

    /**
     * Restrict the visibility of certain canvas assets (like Tokens or DoorControls) based on the visibility polygon
     * These assets should only be displayed if they are visible given the current player's field of view
     */
    restrictVisibility(): void;

    /**
     * Test whether a target point on the Canvas is visible based on the current vision and LOS polygons.
     * @param point   - The point in space to test, an object with coordinates x and y.
     * @param options - Additional options which modify visibility testing.
     * @returns Whether the point is currently visible.
     */
    testVisibility(
      point: Canvas.Point,
      options?: CanvasVisibility.TestVisibilityOptions, // not:null (destructured when passed to _createVisibilityTestConfig)
    ): boolean;

    /**
     * Create the visibility test config.
     * @param point   - The point in space to test, an object with coordinates x and y.
     * @param options - Additional options which modify visibility testing.
     * @remarks Foundry marked `@internal`
     */
    protected _createVisibilityTestConfig(
      point: Canvas.Point,
      options?: CanvasVisibility.CreateTestConfigOptions, // not:null (destructured)
    ): CanvasVisibility.TestConfig;

    /**
     * @deprecated since v11, will be removed in v13
     * @remarks `"fogOverlay is deprecated in favor of visibilityOverlay"`
     */
    get fogOverlay(): this["visibilityOverlay"];
  }

  namespace CanvasVisibility {
    interface Any extends AnyCanvasVisibility {}
    interface AnyConstructor extends Identity<typeof AnyCanvasVisibility> {}

    interface DrawOptions extends CanvasGroupMixin.DrawOptions {}

    interface TearDownOptions extends CanvasGroupMixin.TearDownOptions {}

    type TestObject = PlaceableObject.Any | null;

    interface VisionModeData {
      source: foundry.canvas.sources.PointVisionSource.Any | null | undefined;
      activeLightingOptions: IntentionalPartial<VisionMode["lighting"]>;
    }

    interface LightingVisibility {
      illumination: VisionMode.LIGHTING_VISIBILITY;
      background: VisionMode.LIGHTING_VISIBILITY;
      coloration: VisionMode.LIGHTING_VISIBILITY;
      darkness: VisionMode.LIGHTING_VISIBILITY;

      /** @remarks Only set `false` if all other keys are `VisionMode.LIGHTING_VISIBILITY.DISABLED` */
      any: boolean;
    }

    interface TestVisibilityOptions extends CreateTestConfigOptions {}

    /** @internal */
    type _CreateTestConfigOptions = InexactPartial<{
      /**
       * A numeric radial offset which allows for a non-exact match.
       * For example, if tolerance is 2 then the test will pass if the point
       * is within 2px of a vision polygon
       * @defaultValue `2`
       * @remarks Can't be `null` because it only has a parameter default
       */
      tolerance: number;

      /**
       * An optional reference to the object whose visibility is being tested
       * @defaultValue `null`
       */
      object: TestObject;
    }>;

    interface CreateTestConfigOptions extends _CreateTestConfigOptions {}

    /** @internal */
    type _TestConfigOptional = NullishProps<{
      /**
       * The target object
       * @defaultValue `null`
       * @remarks Only checked in `#_canDetect` for `instanceof Token`
       */
      object: TestObject;
    }>;

    /** @internal */
    interface _TestConfigRequired {
      /** An array of visibility tests */
      tests: CanvasVisibility.Test[];
    }

    interface TestConfig extends _TestConfigRequired, _TestConfigOptional {}

    interface Test {
      point: Canvas.Point;
      elevation: number;
      los: Map<foundry.canvas.sources.PointVisionSource.Any, boolean>;
    }

    /**
     * @privateRemarks This is a fixed subset of `PIXI.IBaseTextureOptions` that `CanvasVisibility##createTextureConfiguration` produces.
     * Since it's generated by a private method and stored in a private property, it's not meaningfully extensible (`canvas.visibility.textureConfiguration.foo = "bar"` doesn't count)
     */
    interface TextureConfiguration {
      resolution: number;
      width: number;
      height: number;
      mipmap: PIXI.MIPMAP_MODES;
      multisample: PIXI.MSAA_QUALITY;
      scaleMode: PIXI.SCALE_MODES;
      alphaMode: PIXI.ALPHA_MODES;
      format: PIXI.FORMATS;
    }
  }
}

declare abstract class AnyCanvasVisibility extends CanvasVisibility {
  constructor(...args: never);
}
