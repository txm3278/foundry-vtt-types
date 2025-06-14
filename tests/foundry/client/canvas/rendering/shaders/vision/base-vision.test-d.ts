import { expectTypeOf } from "vitest";
import { AdaptiveVisionShader } from "#client/canvas/rendering/shaders/_module.mjs";

const AVS = AdaptiveVisionShader;
let myAVS;

expectTypeOf(AVS.FRAGMENT_FUNCTIONS).toEqualTypeOf<string>();
expectTypeOf(AVS.SHADER_TECHNIQUES).toEqualTypeOf<Record<string, AdaptiveLightingShader.ShaderTechnique>>();
expectTypeOf((myAVS = AVS.create())).toEqualTypeOf<AdaptiveVisionShader>();

expectTypeOf(myAVS["_preRender"]).toEqualTypeOf<AbstractBaseShader.PreRenderFunction>();
