declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    WizardDialog: typeof import('src/plugins/wizardry/components/WizardDialog.vue').default;
    WizardBody: typeof import('src/plugins/wizardry/components/WizardBody.vue').default;
    WidgetWizardPicker: typeof import('src/plugins/wizardry/components/WidgetWizardPicker.vue').default;
    SystemBlockWidgetWizard: typeof import('src/plugins/wizardry/components/SystemBlockWidgetWizard.vue').default;
    QuickstartWizardPicker: typeof import('src/plugins/wizardry/components/QuickstartWizardPicker.vue').default;
    ImportWizard: typeof import('src/plugins/wizardry/components/ImportWizard.vue').default;
    GenericWidgetWizard: typeof import('src/plugins/wizardry/components/GenericWidgetWizard.vue').default;
    DashboardWizard: typeof import('src/plugins/wizardry/components/DashboardWizard.vue').default;
    BlockWizard: typeof import('src/plugins/wizardry/components/BlockWizard.vue').default;
    BlockWidgetWizard: typeof import('src/plugins/wizardry/components/BlockWidgetWizard.vue').default;
    BlockDiscoveryWizard: typeof import('src/plugins/wizardry/components/BlockDiscoveryWizard.vue').default;
    TiltValues: typeof import('src/plugins/tilt/components/TiltValues.vue').default;
    TiltPage: typeof import('src/plugins/tilt/components/TiltPage.vue').default;
    TiltActions: typeof import('src/plugins/tilt/components/TiltActions.vue').default;
    ValveArray: typeof import('src/plugins/spark/components/widget/ValveArray.vue').default;
    UnknownBlockWidget: typeof import('src/plugins/spark/components/widget/UnknownBlockWidget.vue').default;
    RelationsDialog: typeof import('src/plugins/spark/components/widget/RelationsDialog.vue').default;
    RelationsDiagram: typeof import('src/plugins/spark/components/widget/RelationsDiagram.vue').default;
    OneWireGpioEditor: typeof import('src/plugins/spark/components/widget/OneWireGpioEditor.vue').default;
    IoArray: typeof import('src/plugins/spark/components/widget/IoArray.vue').default;
    GpioChannelDialog: typeof import('src/plugins/spark/components/widget/GpioChannelDialog.vue').default;
    BlockGraph: typeof import('src/plugins/spark/components/widget/BlockGraph.vue').default;
    BlockWidgetToolbar: typeof import('src/plugins/spark/components/toolbar/BlockWidgetToolbar.vue').default;
    BlockActions: typeof import('src/plugins/spark/components/toolbar/BlockActions.vue').default;
    SparkWifiMenu: typeof import('src/plugins/spark/components/menu/SparkWifiMenu.vue').default;
    SparkParticleWifiCard: typeof import('src/plugins/spark/components/menu/SparkParticleWifiCard.vue').default;
    SparkEspWifiCard: typeof import('src/plugins/spark/components/menu/SparkEspWifiCard.vue').default;
    SparkBackupMenu: typeof import('src/plugins/spark/components/menu/SparkBackupMenu.vue').default;
    FirmwareUpdateDialog: typeof import('src/plugins/spark/components/menu/FirmwareUpdateDialog.vue').default;
    StringValEdit: typeof import('src/plugins/spark/components/form/StringValEdit.vue').default;
    StateValEdit: typeof import('src/plugins/spark/components/form/StateValEdit.vue').default;
    SetpointSettingDialog: typeof import('src/plugins/spark/components/form/SetpointSettingDialog.vue').default;
    QuantityValEdit: typeof import('src/plugins/spark/components/form/QuantityValEdit.vue').default;
    NumberValEdit: typeof import('src/plugins/spark/components/form/NumberValEdit.vue').default;
    LinkValEdit: typeof import('src/plugins/spark/components/form/LinkValEdit.vue').default;
    EnumValEdit: typeof import('src/plugins/spark/components/form/EnumValEdit.vue').default;
    DurationValEdit: typeof import('src/plugins/spark/components/form/DurationValEdit.vue').default;
    DigitalConstraintsValEdit: typeof import('src/plugins/spark/components/form/DigitalConstraintsValEdit.vue').default;
    DigitalConstraints: typeof import('src/plugins/spark/components/form/DigitalConstraints.vue').default;
    DateValEdit: typeof import('src/plugins/spark/components/form/DateValEdit.vue').default;
    ConstraintsField: typeof import('src/plugins/spark/components/form/ConstraintsField.vue').default;
    ConstraintsDialog: typeof import('src/plugins/spark/components/form/ConstraintsDialog.vue').default;
    ClaimIndicator: typeof import('src/plugins/spark/components/form/ClaimIndicator.vue').default;
    ChannelSelectField: typeof import('src/plugins/spark/components/form/ChannelSelectField.vue').default;
    BoolValEdit: typeof import('src/plugins/spark/components/form/BoolValEdit.vue').default;
    BlockHistoryGraph: typeof import('src/plugins/spark/components/form/BlockHistoryGraph.vue').default;
    BlockFieldDialog: typeof import('src/plugins/spark/components/form/BlockFieldDialog.vue').default;
    BlockEnableToggle: typeof import('src/plugins/spark/components/form/BlockEnableToggle.vue').default;
    BlockDialogButton: typeof import('src/plugins/spark/components/form/BlockDialogButton.vue').default;
    AnalogConstraintsValEdit: typeof import('src/plugins/spark/components/form/AnalogConstraintsValEdit.vue').default;
    AnalogConstraints: typeof import('src/plugins/spark/components/form/AnalogConstraints.vue').default;
    QuickstartTaskMaster: typeof import('src/plugins/quickstart/components/QuickstartTaskMaster.vue').default;
    QuickstartServiceTask: typeof import('src/plugins/quickstart/components/QuickstartServiceTask.vue').default;
    QuickstartSensorField: typeof import('src/plugins/quickstart/components/QuickstartSensorField.vue').default;
    QuickstartPrefixField: typeof import('src/plugins/quickstart/components/QuickstartPrefixField.vue').default;
    QuickstartNamingTask: typeof import('src/plugins/quickstart/components/QuickstartNamingTask.vue').default;
    QuickstartNameField: typeof import('src/plugins/quickstart/components/QuickstartNameField.vue').default;
    QuickstartMockCreateField: typeof import('src/plugins/quickstart/components/QuickstartMockCreateField.vue').default;
    QuickstartDiscoveryTask: typeof import('src/plugins/quickstart/components/QuickstartDiscoveryTask.vue').default;
    QuickstartChannelField: typeof import('src/plugins/quickstart/components/QuickstartChannelField.vue').default;
    SelectBlockGraphDialog: typeof import('src/plugins/history/components/SelectBlockGraphDialog.vue').default;
    QueryEditor: typeof import('src/plugins/history/components/QueryEditor.vue').default;
    MetricsEditor: typeof import('src/plugins/history/components/MetricsEditor.vue').default;
    MetricsDisplayDialog: typeof import('src/plugins/history/components/MetricsDisplayDialog.vue').default;
    HistoryGraph: typeof import('src/plugins/history/components/HistoryGraph.vue').default;
    GraphRangeSubmenu: typeof import('src/plugins/history/components/GraphRangeSubmenu.vue').default;
    GraphRangeDialog: typeof import('src/plugins/history/components/GraphRangeDialog.vue').default;
    GraphPeriodEditor: typeof import('src/plugins/history/components/GraphPeriodEditor.vue').default;
    GraphEditorDialog: typeof import('src/plugins/history/components/GraphEditorDialog.vue').default;
    GraphEditor: typeof import('src/plugins/history/components/GraphEditor.vue').default;
    GraphDisplayEditor: typeof import('src/plugins/history/components/GraphDisplayEditor.vue').default;
    GraphDisplayDialog: typeof import('src/plugins/history/components/GraphDisplayDialog.vue').default;
    GraphDialog: typeof import('src/plugins/history/components/GraphDialog.vue').default;
    ExportGraphAction: typeof import('src/plugins/history/components/ExportGraphAction.vue').default;
    ToggleCard: typeof import('src/plugins/builder/components/ToggleCard.vue').default;
    TextCard: typeof import('src/plugins/builder/components/TextCard.vue').default;
    SizeCard: typeof import('src/plugins/builder/components/SizeCard.vue').default;
    SetpointValues: typeof import('src/plugins/builder/components/SetpointValues.vue').default;
    SelectedLayoutDialog: typeof import('src/plugins/builder/components/SelectedLayoutDialog.vue').default;
    SelectCard: typeof import('src/plugins/builder/components/SelectCard.vue').default;
    PwmValues: typeof import('src/plugins/builder/components/PwmValues.vue').default;
    PressureCard: typeof import('src/plugins/builder/components/PressureCard.vue').default;
    PowerIcon: typeof import('src/plugins/builder/components/PowerIcon.vue').default;
    PlacementCard: typeof import('src/plugins/builder/components/PlacementCard.vue').default;
    PartWrapper: typeof import('src/plugins/builder/components/PartWrapper.vue').default;
    OverlapIndicators: typeof import('src/plugins/builder/components/OverlapIndicators.vue').default;
    MetricsCard: typeof import('src/plugins/builder/components/MetricsCard.vue').default;
    LiquidStroke: typeof import('src/plugins/builder/components/LiquidStroke.vue').default;
    LiquidSourceCard: typeof import('src/plugins/builder/components/LiquidSourceCard.vue').default;
    LinkedWidgetCard: typeof import('src/plugins/builder/components/LinkedWidgetCard.vue').default;
    LayoutActions: typeof import('src/plugins/builder/components/LayoutActions.vue').default;
    EditorBackground: typeof import('src/plugins/builder/components/EditorBackground.vue').default;
    ColorCard: typeof import('src/plugins/builder/components/ColorCard.vue').default;
    BuilderToolsMenu: typeof import('src/plugins/builder/components/BuilderToolsMenu.vue').default;
    BuilderPartSettingsDialog: typeof import('src/plugins/builder/components/BuilderPartSettingsDialog.vue').default;
    BuilderLabelValues: typeof import('src/plugins/builder/components/BuilderLabelValues.vue').default;
    BuilderCatalogDialog: typeof import('src/plugins/builder/components/BuilderCatalogDialog.vue').default;
    BuilderActions: typeof import('src/plugins/builder/components/BuilderActions.vue').default;
    BorderCard: typeof import('src/plugins/builder/components/BorderCard.vue').default;
    BlockStatusSvg: typeof import('src/plugins/builder/components/BlockStatusSvg.vue').default;
    BlockAddressCard: typeof import('src/plugins/builder/components/BlockAddressCard.vue').default;
    AnimatedArrows: typeof import('src/plugins/builder/components/AnimatedArrows.vue').default;
    WidgetProvider: typeof import('src/components/widget/WidgetProvider.vue').default;
    WidgetDialog: typeof import('src/components/widget/WidgetDialog.vue').default;
    BlockWidgetDialog: typeof import('src/components/widget/BlockWidgetDialog.vue').default;
    WidgetToolbar: typeof import('src/components/toolbar/WidgetToolbar.vue').default;
    WidgetActions: typeof import('src/components/toolbar/WidgetActions.vue').default;
    Toolbar: typeof import('src/components/toolbar/Toolbar.vue').default;
    LayoutHeader: typeof import('src/components/toolbar/LayoutHeader.vue').default;
    LayoutFooter: typeof import('src/components/toolbar/LayoutFooter.vue').default;
    DialogCloseButton: typeof import('src/components/toolbar/DialogCloseButton.vue').default;
    ActionSubmenu: typeof import('src/components/toolbar/ActionSubmenu.vue').default;
    ActionMenu: typeof import('src/components/toolbar/ActionMenu.vue').default;
    TitleTeleport: typeof import('src/components/teleport/TitleTeleport.vue').default;
    ButtonsTeleport: typeof import('src/components/teleport/ButtonsTeleport.vue').default;
    WatcherContainer: typeof import('src/components/sidebar/WatcherContainer.vue').default;
    SidebarNavigator: typeof import('src/components/sidebar/SidebarNavigator.vue').default;
    SidebarIndex: typeof import('src/components/sidebar/SidebarIndex.vue').default;
    PlotlyGraph: typeof import('src/components/plotly/PlotlyGraph.vue').default;
    GraphAnnotationDialog: typeof import('src/components/plotly/GraphAnnotationDialog.vue').default;
    GenericGraph: typeof import('src/components/plotly/GenericGraph.vue').default;
    PageError: typeof import('src/components/misc/PageError.vue').default;
    ExportErrorsAction: typeof import('src/components/menu/ExportErrorsAction.vue').default;
    ExportAction: typeof import('src/components/menu/ExportAction.vue').default;
    DashboardActions: typeof import('src/components/menu/DashboardActions.vue').default;
    ActionItem: typeof import('src/components/menu/ActionItem.vue').default;
    UnlinkedSvgIcon: typeof import('src/components/icons/UnlinkedSvgIcon.vue').default;
    UnlinkedIcon: typeof import('src/components/icons/UnlinkedIcon.vue').default;
    TiltSvgIcon: typeof import('src/components/icons/TiltSvgIcon.vue').default;
    SleepingSvgIcon: typeof import('src/components/icons/SleepingSvgIcon.vue').default;
    SleepingIcon: typeof import('src/components/icons/SleepingIcon.vue').default;
    SetpointSvgIcon: typeof import('src/components/icons/SetpointSvgIcon.vue').default;
    SessionSvgIcon: typeof import('src/components/icons/SessionSvgIcon.vue').default;
    SensorSvgIcon: typeof import('src/components/icons/SensorSvgIcon.vue').default;
    PwmSvgIcon: typeof import('src/components/icons/PwmSvgIcon.vue').default;
    PwmIcon: typeof import('src/components/icons/PwmIcon.vue').default;
    HeatingSvgIcon: typeof import('src/components/icons/HeatingSvgIcon.vue').default;
    HeatingIcon: typeof import('src/components/icons/HeatingIcon.vue').default;
    CoolingSvgIcon: typeof import('src/components/icons/CoolingSvgIcon.vue').default;
    CoolingIcon: typeof import('src/components/icons/CoolingIcon.vue').default;
    BrokenSvgIcon: typeof import('src/components/icons/BrokenSvgIcon.vue').default;
    BrokenIcon: typeof import('src/components/icons/BrokenIcon.vue').default;
    AnalogSvgIcon: typeof import('src/components/icons/AnalogSvgIcon.vue').default;
    GridItem: typeof import('src/components/grid/GridItem.vue').default;
    GridContainer: typeof import('src/components/grid/GridContainer.vue').default;
    InvalidWidget: typeof import('src/components/generic/InvalidWidget.vue').default;
    DeprecatedWidget: typeof import('src/components/generic/DeprecatedWidget.vue').default;
    TreeSelectDialog: typeof import('src/components/form/TreeSelectDialog.vue').default;
    ToggleButton: typeof import('src/components/form/ToggleButton.vue').default;
    ToggleAction: typeof import('src/components/form/ToggleAction.vue').default;
    TextAreaDialog: typeof import('src/components/form/TextAreaDialog.vue').default;
    TagSelectField: typeof import('src/components/form/TagSelectField.vue').default;
    SliderField: typeof import('src/components/form/SliderField.vue').default;
    SliderDialog: typeof import('src/components/form/SliderDialog.vue').default;
    SettingValueField: typeof import('src/components/form/SettingValueField.vue').default;
    SelectField: typeof import('src/components/form/SelectField.vue').default;
    SelectDialog: typeof import('src/components/form/SelectDialog.vue').default;
    SaveConfirmDialog: typeof import('src/components/form/SaveConfirmDialog.vue').default;
    QuantityField: typeof import('src/components/form/QuantityField.vue').default;
    QuantityDialog: typeof import('src/components/form/QuantityDialog.vue').default;
    MarkdownView: typeof import('src/components/form/MarkdownView.vue').default;
    MarkdownDialog: typeof import('src/components/form/MarkdownDialog.vue').default;
    ListSelect: typeof import('src/components/form/ListSelect.vue').default;
    ListMultiSelect: typeof import('src/components/form/ListMultiSelect.vue').default;
    LinkField: typeof import('src/components/form/LinkField.vue').default;
    LinkDialog: typeof import('src/components/form/LinkDialog.vue').default;
    LabeledField: typeof import('src/components/form/LabeledField.vue').default;
    KeyboardDialog: typeof import('src/components/form/KeyboardDialog.vue').default;
    KeyboardButton: typeof import('src/components/form/KeyboardButton.vue').default;
    InputField: typeof import('src/components/form/InputField.vue').default;
    InputDialog: typeof import('src/components/form/InputDialog.vue').default;
    InlineQuantityField: typeof import('src/components/form/InlineQuantityField.vue').default;
    DurationQuantityDialog: typeof import('src/components/form/DurationQuantityDialog.vue').default;
    DurationField: typeof import('src/components/form/DurationField.vue').default;
    DigitalStateButton: typeof import('src/components/form/DigitalStateButton.vue').default;
    DialogCard: typeof import('src/components/form/DialogCard.vue').default;
    DatetimeInput: typeof import('src/components/form/DatetimeInput.vue').default;
    DatetimeField: typeof import('src/components/form/DatetimeField.vue').default;
    DatetimeDialog: typeof import('src/components/form/DatetimeDialog.vue').default;
    DatepickerDialog: typeof import('src/components/form/DatepickerDialog.vue').default;
    DashboardSelect: typeof import('src/components/form/DashboardSelect.vue').default;
    ConfirmDialog: typeof import('src/components/form/ConfirmDialog.vue').default;
    ColorField: typeof import('src/components/form/ColorField.vue').default;
    ColorDialog: typeof import('src/components/form/ColorDialog.vue').default;
    CheckboxDialog: typeof import('src/components/form/CheckboxDialog.vue').default;
    CardWarning: typeof import('src/components/form/CardWarning.vue').default;
    BlockFieldAddressField: typeof import('src/components/form/BlockFieldAddressField.vue').default;
    BlockFieldAddressDialog: typeof import('src/components/form/BlockFieldAddressDialog.vue').default;
    BlockAddressField: typeof import('src/components/form/BlockAddressField.vue').default;
    BlockAddressDialog: typeof import('src/components/form/BlockAddressDialog.vue').default;
    PreviewCard: typeof import('src/components/card/PreviewCard.vue').default;
    Card: typeof import('src/components/card/Card.vue').default;
  }
}
export {};