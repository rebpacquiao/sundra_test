import videojs, { type VideoJsPlayer } from 'video.js'
import interact from 'interactjs'
import { type Interactable } from '@interactjs/types'

export interface SundraRangeMarkerOptions {
    start: number,
    end?: number,
    distance?: number
}

const Component = videojs.getComponent('Component')
export class SundraRangeMarker extends Component {
    static defaultOptions: SundraRangeMarkerOptions = {
        start: 0,
        distance: 20
    }

    private margin: number = 5
    private start: number
    private end?: number
    private collisionDistance: number

    private startSlider: Interactable
    private endSlider: Interactable

    private rangeBar?: HTMLElement
    private startMarker?: HTMLElement
    private endMarker?: HTMLElement
    private markerOptions: SundraRangeMarkerOptions

    constructor(player: VideoJsPlayer, markerOptions: Partial<SundraRangeMarkerOptions> = {}) {
        super(player)
        player.controlBar.progressControl.disable()
        this.markerOptions = { ...SundraRangeMarker.defaultOptions, ...markerOptions }
        this.start = this.markerOptions.start
        this.end = this.markerOptions.end
        this.collisionDistance = this.markerOptions.distance != null ? this.markerOptions.distance : SundraRangeMarker.defaultOptions.distance!

        this.startSlider = interact('.vjs-rangeselect-marker.start')
        this.endSlider = interact('.vjs-rangeselect-marker.end')
    }

    createEl(): Element {
        // Markers
        this.startMarker = videojs.dom.createEl('div', {
            className: 'vjs-rangeselect-marker start'
        }) as HTMLElement
        this.startMarker.style.left = '0%'
        this.startMarker.style.marginLeft = `${this.margin}px`
        this.startMarker.innerHTML = '['

        this.endMarker = videojs.dom.createEl('div', {
            className: 'vjs-rangeselect-marker end'
        }) as HTMLElement
        this.endMarker.style.right = '0%'
        this.endMarker.style.marginRight = `${this.margin}px`
        this.endMarker.innerHTML = ']'

        this.rangeBar = videojs.dom.createEl('div', {
            className: 'vjs-rangeselect-bar',
            id: 'rangeselect'
        }) as HTMLElement

        const parent = this;
        this.rangeBar.appendChild(this.startMarker)
        this.rangeBar.appendChild(this.endMarker)
        this.player().controlBar.progressControl.el().appendChild(this.rangeBar)
        parent.startSlider = interact('.vjs-rangeselect-marker.start')
        parent.startSlider.draggable({
            origin: 'parent',
            lockAxis: 'x',
            modifiers: [
                interact.modifiers.restrict({ restriction: 'parent' })
            ],
            listeners: {
                move (event) {
                    const { value, max } = parent.calcStartPos(event.pageX)
                    parent.player().trigger('startChanged', { 'seconds': parent.player().duration() * Math.min(value, max) })
                },
                end (event) {
                    const { value, max } = parent.calcStartPos(event.pageX)
                    let pos = parent.player().duration() * Math.min(value, max)
                    parent.setStartTime(pos)
                }
            }
        })
        parent.endSlider = interact('.vjs-rangeselect-marker.end')
        parent.endSlider.draggable({
            origin: this.rangeBar,
            lockAxis: 'x',
            modifiers: [
                interact.modifiers.restrict({ restriction: 'parent' })
            ],
            listeners: {
                move (event) {
                    const { value, max } = parent.calcEndPos(event.pageX)
                    parent.player().trigger('endChanged', { 'seconds': parent.player().duration() * Math.max(value, max) })
                },
                end (event) {
                    const { value, max } = parent.calcEndPos(event.pageX)
                    parent.setEndTime(parent.player().duration() * Math.max(value, max))
                }
            }
        })

        return this.rangeBar
    }


    public calcStartPos(pageX: number) {
        const parentNode = document.getElementById('rangeselect')
        const target = document.querySelector('.vjs-rangeselect-marker.start') as HTMLElement
        if (parentNode != null && target != null) {
            const parentRect = interact.getElementRect(parentNode)
            const endRect = this.endSlider.getRect()
            const maxVal = Number(((endRect.left - parentRect.left - this.collisionDistance) / parentRect.width).toFixed(2));
            const sliderWidth = parentRect.width
            const value = Number((pageX / sliderWidth).toFixed(2))
            if (target != null) {
                target.style.left = (Math.min(value, maxVal) * 100) + '%'
                target.setAttribute('data-value', value.toFixed(2))
            }
            return { value: value, max: maxVal }
        }
        return { value: 0, max: 0 }
    }
    public calcEndPos(pageX: number) {
        const parentNode = document.getElementById('rangeselect')
        const target = document.querySelector('.vjs-rangeselect-marker.end') as HTMLElement
        if (parentNode != null && target != null) {
            const parentRect = interact.getElementRect(parentNode)
            const startRect = this.startSlider.getRect()
            const maxVal = Number(((startRect.left - parentRect.left + (this.collisionDistance + this.margin)) / parentRect.width).toFixed(2))
            const sliderWidth = parentRect.width
            const value = Number((pageX / sliderWidth).toFixed(2))
            if (target != null) {
                target.style.right = (100 - (Math.max(value, maxVal) * 100)) + '%'
                target.setAttribute('data-value', value.toFixed(2))
            }

            return { value: value, max: maxVal }
        }
        return { value: 0, max: 0 }
    }

    public setStartTime(seconds: number): void {
        if (seconds < 0) { seconds = 0 }
        this.start = seconds
        this.player().currentTime( seconds )
        this.player().on("timeupdate", videojs.bind(this, this.loop))
        this.player().trigger('startChanged', { 'seconds': seconds })

        const parentNode = document.getElementById('rangeselect') as HTMLElement
        const parentRect = interact.getElementRect(parentNode)
        const percent = (seconds / this.player().duration()) * parentRect.width
        this.calcStartPos(percent)
    }
    public getStartTime(): number {
        return this.start;
    }

    public setEndTime(seconds: number): void {
        if (seconds > this.player().duration()) { seconds = this.player().duration() }
        this.end = seconds
        this.player().currentTime( this.getStartTime() )
        this.player().on("timeupdate", videojs.bind(this, this.loop))
        this.player().trigger('endChanged', { 'seconds': seconds })

        const parentNode = document.getElementById('rangeselect') as HTMLElement
        const parentRect = interact.getElementRect(parentNode)
        const percent = (seconds / this.player().duration()) * parentRect.width
        this.calcEndPos(percent)
    }
    public getEndTime() {
        return this.end ?? this.player().duration()
    }

    protected loop(): void {
        let loopStart = this.getStartTime();
        let loopEnd = this.getEndTime();
        if (this.player().currentTime() < loopStart || this.player().currentTime() >= loopEnd) {
            this.player().currentTime(loopStart);
        }
    }
}

const Plugin = videojs.getPlugin('plugin')
export class SundraRangeMarkerPlugin extends Plugin {
    public player: VideoJsPlayer;
    public rangemarker?: SundraRangeMarker;

    constructor(player: VideoJsPlayer, options?: SundraRangeMarkerOptions) {
        super(player, options);
        this.player = player

        player.ready(async () => {
            this.rangemarker = new SundraRangeMarker(player, options)
            await player.play()
            player.pause()
        });
    }
}
/*
declare module 'video.js' {
    export interface VideoJsPlayer {
        sundraRangeMarker: (options?: Partial<SundraRangeMarkerOptions>) => SundraRangeMarkerPlugin
    }
}
*/