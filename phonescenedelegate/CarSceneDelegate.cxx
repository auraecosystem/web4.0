- (CPMapTemplate *)getTemplate {
  CPMapTemplate *template = [[CPMapTemplate alloc] init];
  [template showPanningInterfaceAnimated:YES];
 
  CPBarButton *customButton = [[CPBarButton alloc]
      initWithTitle:@"Custom Event"
            handler:^(CPBarButton ***_Nonnull** button) {
              NSMutableDictionary *dictionary = [
	              [NSMutableDictionary alloc] init
	          ];
              dictionary[@"sampleDataKey"] = @"sampleDataContent";
              [[NavAutoModule getOrCreateSharedInstance]
	              onCustomNavigationAutoEvent:@"sampleEvent"
	              data:dictionary
	          ];
            }];

  template.leadingNavigationBarButtons = @[ customButton ];
  template.trailingNavigationBarButtons = @[];
  return template;
}
