import React from 'react';
import {PluginClient, usePlugin, createState, useValue, Layout} from 'flipper-plugin';
import {ManagedDataInspector, DetailSidebar} from 'flipper';

type Data = {
  id: string;
  name?: string;
  lifecycle?: string;
  type?: string;
};

type Events = {
  newData: Data;
};

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, {}>) {
  const data = createState<Record<string, Data>>({}, {persist: 'data'});

  client.onMessage('newData', (newData) => {
    data.update((draft) => {
      draft[newData.id] = newData;
    });
  });

  client.addMenuEntry({
    action: 'clear',
    handler: async () => {
      data.set({});
    },
  });

  return {data};
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
  const instance = usePlugin(plugin);
  const data = useValue(instance.data);

   console.log("lf", data)
   console.log("lf", data[0])
   if (Object.keys(data).length < 1) {
      return (
          <Layout.ScrollContainer>
                <p>Empty</p>
          </Layout.ScrollContainer>
      );
   } else {
       return (
            <Layout.ScrollContainer>
               <p>De la data</p>
                 <ManagedDataInspector data={data} expandRoot={true} />
            </Layout.ScrollContainer>
       );
   }
}
