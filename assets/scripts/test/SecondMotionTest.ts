import { _decorator, Camera, Component, easing, EventTouch, geometry, input, Input, Label, lerp, ModelComponent, Node, Quat, Slider, Vec3 } from 'cc';
import { mapRangeFrom01, mapRangeTo01 } from '../helper/Helper';
import { SecondOrderDynamics } from '../helper/SecondOrderDynamics';
const { ccclass, property } = _decorator;

const fMin: number = 0.1;
const fMax: number = 5;

const zMin: number = 0;
const zMax: number = 2;

const rMin: number = -3;
const rMax: number = 3;

@ccclass('SecondMotionTest')
export class SecondMotionTest extends Component {

    @property(Camera) private camera: Camera = null;

    @property(Node) private groundPlane: Node = null;
    @property(Node) private targetObject: Node = null;
    @property(Node) private followObject: Node = null;

    private planeModel: ModelComponent = null;
    private hitPoint: Vec3 = new Vec3();

    protected onLoad(): void {
        this.camera = this.node.getComponent(Camera);
        this.planeModel = this.groundPlane.getComponent(ModelComponent);
    }

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.input_onTouchMove.bind(this));
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_MOVE);
    }

    protected start(): void {
        this.initialSetup();
    }

    private input_onTouchMove(event: EventTouch) {

        const uiLocation = event.getLocation();

        const ray = this.camera.screenPointToRay(uiLocation.x, uiLocation.y);
        const distance = geometry.intersect.rayModel(ray, this.planeModel.model);

        ray.computeHit(this.hitPoint, distance)

        this.targetObject.setPosition(this.hitPoint);
    }

    private frequency: number = 3;
    private dampening: number = 0.5;
    private response: number = -2.5;

    private dynamicsX: SecondOrderDynamics = new SecondOrderDynamics(3, 0.5, -2.5, 0);
    private dynamicsZ: SecondOrderDynamics = new SecondOrderDynamics(3, 0.5, -2.5, 0);
    
    private followPosition: Vec3 = new Vec3();

    private xQuat: Quat = new Quat();
    private zQuat: Quat = new Quat();
    private outQuat: Quat = new Quat();

    private maxAngle: number = 0.3;

    update(deltaTime: number) {

        this.dynamicsX.setup(this.frequency, this.dampening, this.response);
        this.dynamicsZ.setup(this.frequency, this.dampening, this.response);

        const distance = Vec3.distance(this.targetObject.position, this.followObject.position);

        this.followPosition.x = this.dynamicsX.update(deltaTime, this.targetObject.position.x);
        this.followPosition.z = this.dynamicsZ.update(deltaTime, this.targetObject.position.z);

        const xRot = lerp(
            0,
            Math.PI * this.maxAngle,
            easing.linear((this.followPosition.z - this.followObject.position.z) / distance)
        );
        Quat.fromAxisAngle(this.xQuat, Vec3.RIGHT, xRot);

        const zRot = lerp(
            0,
            Math.PI * this.maxAngle,
            easing.linear((this.followObject.position.x - this.followPosition.x) / distance)
        );
        Quat.fromAxisAngle(this.zQuat, Vec3.FORWARD, zRot);
        
        Quat.multiply(this.outQuat, this.xQuat, this.zQuat);
        
        this.followObject.setPosition(this.followPosition);
        this.followObject.setRotation(this.outQuat);
    }

    @property(Label) private fLabel: Label = null;
    @property(Label) private zLabel: Label = null;
    @property(Label) private rLabel: Label = null;

    @property(Slider) private fSlider: Slider = null;
    @property(Slider) private zSlider: Slider = null;
    @property(Slider) private rSlider: Slider = null;

    private initialSetup() {
        this.fSlider.progress = mapRangeTo01(this.frequency, fMin, fMax);
        this.zSlider.progress = mapRangeTo01(this.dampening, zMin, zMax);
        this.rSlider.progress = mapRangeTo01(this.response, rMin, rMax);

        this.fLabel.string = `f(${this.frequency.toFixed (2)})`;
        this.zLabel.string = `z(${this.dampening.toFixed (2)})`;
        this.rLabel.string = `r(${this.response.toFixed (2)})`;
    }

    private onChangeF(slider: Slider) {
        this.frequency = mapRangeFrom01(slider.progress, fMin, fMax);
        this.fLabel.string = `f(${this.frequency.toFixed (2)})`;
    }

    private onChangeZ(slider: Slider) {
        this.dampening = mapRangeFrom01(slider.progress, zMin, zMax);
        this.zLabel.string = `z(${this.dampening.toFixed (2)})`;
    }

    private onChangeR(slider: Slider) {
        this.response = mapRangeFrom01(slider.progress, rMin, rMax);
        this.rLabel.string = `r(${this.response.toFixed (2)})`;
    }
}


