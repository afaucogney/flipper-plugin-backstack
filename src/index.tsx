import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import {ManagedDataInspector, DetailSidebar} from 'flipper';
import {  List,  Typography,  Divider,  Select,  Card,  Avatar,  Tag,  Col,  Row, Timeline, Spin} from "antd";

type Data = {
  id: string;
  name?: string;
  lifecycle?: string;
  type?: string;
};

type Event = {
  id: string;
  name?: string;
  lifeCycle: string;
  type?: string;
  timestamp: String;
};

type Events = {
  newData: Data;
  newEvent: Event;
};

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, {}>) {
  const data = createState<Record<string, Data>>({}, {persist: 'data'});
  const event = createState<Record<string, Event>>({}, {persist: 'event'});

  client.onMessage('newData', (newData) => {
    data.update((draft) => {
      draft[newData.id] = newData;
    });
  });

  client.onMessage('newEvent', (newEvent) => {
    event.update((draft) => {
      draft[newEvent.id] = newEvent;
    });
  });

  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      data.set({});
    },
  });

  return {
    data,
    event
  };
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);
  const data = useValue(instance.data);
  const events = useValue(instance.event);

  if (Object.keys(data).length < 1) {
    return (
      <Layout.ScrollContainer>
        <Spin size="large" />;
      </Layout.ScrollContainer>
    );
  } else {
    return (
      <>
        <Layout.ScrollContainer>{renderStackTree(data)}</Layout.ScrollContainer>
        <DetailSidebar>{renderSidebar(events)}</DetailSidebar>
      </>            
    );
  }

  function renderStackTree(data : Record<string,Data>) {
    return (
      <>
        <Typography.Title level={4}>App stack structure</Typography.Title>
        <ManagedDataInspector data={data} expandRoot={true} />
      </>
    );
  }

   function renderSidebar(events: unknown) {
    if (events == undefined || Object.keys(events).length < 1) {
      return (
        <Spin size="large" />
      );
    } else {
      return (
        <Layout.Container gap pad>
          <Typography.Title level={4}>Event log</Typography.Title>
          <Timeline mode="right">{renderTimeLineItems(Object.values(events)[0])}</Timeline>
        </Layout.Container>
      );
    }
  }

  function renderTimeLineItems(items : [Object]) {
    console.log("lfe0", items)
    if (items == undefined ) {
      return ""
    } else {
      var result = []
      for (var item of items){
        result.push(
              <Timeline.Item color={getColor(item)} label={item["timestamp"]}>
                {item["lifeCycle"]}
                <p> {item["name"]} ({item["id"]})</p>
              </Timeline.Item>
          )
      }
      console.log("lfe1", result)
      return result.reverse()
    }
  }

  function getColor(item : Event){
    switch (item["lifeCycle"]) {
      case "ON_ACTIVITY_CREATED":
      case "ON_ACTIVITY_STARTED" :
      case "ON_ACTIVITY_RESUMED": 
      case "ON_FRAGMENT_ATTACHED":
      case "ON_FRAGMENT_CREATED":
      case "ON_FRAGMENT_VIEW_CREATED":
      case "ON_FRAGMENT_ACTIVITY_CREATED":
      case "ON_FRAGMENT_STARTED":
      case "ON_FRAGMENT_RESUMED":
        return "green"
      case "ON_ACTIVITY_PAUSED":
      case "ON_FRAGMENT_PAUSED":
        return "orange"
      case "ON_ACTIVITY_STOPPED":
      case "ON_ACTIVITY_SAVE_INSTANCE_STATE":
      case "ON_ACTIVITY_DESTROYED":
      case "ON_FRAGMENT_STOPPED":
      case "ON_FRAGMENT_SAVE_INSTANCE_STATE":
      case "ON_FRAGMENT_VIEW_DESTROYED":
      case "ON_FRAGMENT_DESTROYED":
      case "ON_FRAGMENT_DETACHED":
        return "red"
    }
  }
}
