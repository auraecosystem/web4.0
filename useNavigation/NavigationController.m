const { navigationController } = useNavigation();

const showTermsDialog = async () => {
  // Uses options from NavigationProvider by default
  const accepted = await navigationController.showTermsAndConditionsDialog();
  return accepted;
};

// You can also override specific options:
const showTermsDialogWithOverride = async () => {
  const accepted = await navigationController.showTermsAndConditionsDialog({
    showOnlyDisclaimer: true, // Override specific options
  });
  return accepted;
};
