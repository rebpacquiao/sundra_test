export enum EditorRowAction {
    Edit    = 'Edit',
    Delete  = 'Delete',
    Merge   = 'Merge',
    Add     = 'Add',
    None    = 'None'
}

export interface ParsedSrtFormat {
    id: string,
    startTime: string,
    startSeconds: number,
    endTime: string,
    endSeconds: number,
    text: string
}

export enum SundraCache {
    Keep,
    Reload
}

export enum SundraTier {
    Creator     = 'Creator',
    Producer    = 'Producer',
    Broadcaster = 'Broadcaster',
    Corporate   = 'Corporate',
    Personal    = 'Personal',
    Business    = 'Business',
    Enterprise  = 'Enterprise'
}

export enum SundraPaymentPeriod {
    Monthly = 'monthly',
    Yearly  = 'yearly'
}

export enum SundraQueue {
    Tus         = 'tus',
    Upload      = 'upload',
    Transcribe  = 'transcribe',
    Encoding    = 'encoding',
    Export      = 'export',
    Minutes     = 'minutes'
}

export enum SundraNotificationCategory {
    Subscriptions   = 'subscriptions',
    UI              = 'ui',
    Assets          = 'assets',
    Files           = 'files',
    Export          = 'export'
}

export enum SundraNotificationType {
    Success = 'success',
    Info    = 'info',
    Warning = 'warning',
    Error   = 'error',
    Generic = 'generic'
}

export enum SundraAction {
    Dispatched      = 'dispatched',
    Started         = 'started',
    Progress        = 'progress',
    Transcribing    = 'transcribing',
    Completed       = 'completed',
    Failed          = 'failed',
    Abandoned       = 'abandoned'
}

export enum SundraUploadStatus {
    Idle        = 'idle',
    Waiting     = 'waiting',
    Uploading   = 'uploading',
    Uploaded    = 'uploaded',
    Incomplete  = 'incomplete',
    Completed   = 'completed',
    Cancelled   = 'cancelled',
    Failed      = 'failed',
    Processing  = 'processing'
}

export enum SundraStatus {
    Waiting         = 'waiting',
    Uploading       = 'uploading',
    Processing      = 'processing',
    Failed          = 'failed',
    Transcribing    = 'transcribing',
    Completed       = 'completed',
    Abandoned       = 'abandoned'
}

export enum SundraTranscriptionService {
    AWS         = 'AWS',
    Google      = 'Google',
    Microsoft   = 'Microsoft',
    Rev         = 'Rev',
    IBM         = 'IBM',
    OpenAI      = 'OpenAI'
}

export enum SundraMediaType {
    Video = 'video',
    Audio = 'audio',
    Text = 'document',
    Image = 'image',
    Other = 'other'
}

export enum SundraSubtitlePosition {
    Top     = 'top',
    Center  = 'center',
    Bottom  = 'bottom'
}
export enum SundraTranscriptionOptions {
    Subtitle = 'subtitle',
    Transcript = 'transcript',
    All = 'all'
}

export enum SundraSubtitleType {
    SRT = 'srt',
    VTT = 'vtt'
}

export enum SundraSubtitleBaking {
    None    = 'none',
    Soft    = 'soft',
    Hard    = 'hard',
    Both    = 'both'
}

export interface SundraTag {
    id:     number,
    slug:   string,
    tag:    string,
    tagged_files?: number
}

export interface ApiError {
    status: string,
    message?: string,
    data?: string[]|string,
    errors?: string[]|string
}

export enum SundraTeamRole {
    Owner = 'owner',
    Admin = 'admin',
    Member = 'member'
}
export interface SundraTeam {
    id: number,
    name: string,
    role: SundraTeamRole,
    is_active: boolean
}

export interface SundraUserCoupon {
    percentage?: number,
    amount?: number
}

export interface SundraUser {
    id: number,
    name: string,
    email: string,
    email_verified_at: string,
    job_description: string,
    is_admin: boolean,
    created_at: string,
    updated_at: string,
    last_logged_in: string,
    last_login_ip: string,
    currency: string,
    has_team: boolean,
    has_subscription: boolean,
    tier: SundraTier,
    payment_period: SundraPaymentPeriod,
    on_trial: boolean,
    has_canceled?: boolean,
    has_incomplete_payment?: boolean,
    has_ended_subscription?: boolean,
    usage: SundraUsageItem,
    teams?: SundraTeam[],
    coupon?: SundraUserCoupon
}

export interface SundraSubscriptionPrice {
    USD: number,
    ISK?: number
}

export interface SundraSubscriptionConfigPrice {
    monthly: SundraSubscriptionPrice,
    yearly: SundraSubscriptionPrice,
    per_minute: SundraSubscriptionPrice
}

export interface SundraSubscriptionConfigItem {
    name: string,
    button: string,
    price: SundraSubscriptionConfigPrice,
    description: string,
    tagline: string,
    lines: string[]
}

export interface SundraSubscriptionServiceItem {
    creator: SundraSubscriptionConfigItem,
    producer: SundraSubscriptionConfigItem,
    broadcaster: SundraSubscriptionConfigItem,
    personal?: SundraSubscriptionConfigItem,
    business?: SundraSubscriptionConfigItem,
    enterprise?: SundraSubscriptionConfigItem
}

export interface SundraUsageItem {
    storage_allowed: number,
    storage_current: number,
    duration_allowed: number,
    duration_current: number,
    duration_period: number,
    max_resolution: '720p' | '1080p' | '4k' | '8k'
}

export interface SundraCacheItem<T> {
    data:T,
    stale:boolean
}

export interface SundraPollingEvent {
    queue:      SundraQueue,
    action:     SundraAction,
    slug:       string,
    child:      string,
    progress?:  number
}

export interface SundraNotification {
    slug: string,
    child: string,
    type: SundraNotificationType,
    message: string,
    is_completed: boolean,
    is_showing: boolean,
    is_disposable?: boolean,
    is_permanent?: boolean,
    progress?: number,
    route?: string
}

export interface SundraUpload {
    id: number,
    user_id: number,
    files_id: string|null,
    tus_url: string,
    slug: string|null,
    filename: string,
    language: string,
    status: SundraUploadStatus,
    media: 'audio'|'video'|'image'|'other',
    error: string,
    bytes_uploaded: number,
    bytes_total: number,
    created_at: Date,
    progress?: number,
    is_displayed?: boolean
}

export interface SundraFile {
    id: number,
    owner: number,
    media: string,
    slug: string,
    name: string,
    title: string,
    filename: string,
    original: string,
    extension: string,
    filesize: number|null,
    description: string|null,
    language: string|null,
    location: string|null,
    creation_date: Date|null,
    category: string|null,
    ip: string,
    status: SundraStatus,
    status_error: string|null,
    progress: number,
    progress_task: string|null,
    running_time: number,
    started_at: Date|null,
    created_at: Date,
    has_ongoing: boolean,
    has_transcription: boolean,
    video?: SundraVideo,
    audio?: SundraAudio,
    image?: SundraImage,
    exports?: SundraVideo[]
    instances?: number,
    is_main?: boolean,
    tags?: SundraTag[]
}

export enum SundraVersionType {
    Original    = "original",
    Processed   = "processed",
    Streaming   = "streaming",
    Subtitle    = "subtitle"
}

export enum SundraVideoType {
    Complete    = 'complete',
    Progressing = 'progressing',
    Submitted   = 'submitted',
    Canceled    = 'canceled',
    Error       = 'error'
}

export interface SundraVideo {
    id: number,
    files_id: number,
    version: SundraVersionType,
    version_id: string,
    status: SundraVideoType,
    type: string,
    width: number,
    height: number,
    duration: string,
    filesize: number,
    start: number,
    stop: number|null,
    video_codec: string,
    video_codec_long: string,
    audio_codec: string,
    audio_codec_long: string,
    aspect_ratio: string,
    framerate: string,
    time_base: string,
    codec_time_base: string|null,
    bitrate: number,
    sample_rate: number,
    profile: string,
    level: number
}

export interface SundraAudio {
    id: number,
    files_id: number,
    version: string,
    duration: string,
    filesize: number,
    start: number,
    stop: number|null,
    audio_codec: string,
    audio_codec_long: string,
    bitrate: number,
    sample_rate: number,
    profile: string,
    level: number
}

export interface SundraImage {
    id: number,
    files_id: number,
    width: number,
    height: number,
    codec: string,
}

export enum SundraMinuteType {
    Minutes = 'minutes',
    Short   = 'short',
    Long    = 'long'
}

export interface SundraMeetingMinute {
    id: number,
    user_id: number,
    files_id: number,
    type: SundraMinuteType,
    language: string,
    status: SundraStatus,
    content: string|null,
    started_at: Date|null,
    finished_at: Date|null
}

export interface SundraTranslation {
    id: number,
    user_id: number,
    files_id: number,
    language: string,
    service: SundraTranscriptionService,
    status: SundraStatus,
    subtitle: string|null,
    started_at: Date|null,
    finished_at: Date|null
}

export interface SundraTranscription {
    id: number,
    user_id: number,
    files_id: number,
    job_id: string,
    language: string,
    transcript: SundraTranscript,
    content: string|null,
    subtitle: string|null,
    type: SundraSubtitleType,
    status: SundraStatus,
    service: SundraTranscriptionService,
    started_at: Date|null,
    finished_at: Date|null
}

export interface SundraTranscriptWord {
    word: string,
    start: number,
    end: number
}

export interface SundraTranscript {
    transcript: string,
    words: SundraTranscriptWord[]
}

export interface SundraSubtitle {
    id: number,
    start: string|null,
    end: string|null,
    text: string|null
}