using System;
using System.Threading.Tasks;
using ViconDataStreamSDK.DotNET;
using System.Collections.Generic;

public class Startup
{
    public async Task<object> Invoke(dynamic input)
    {

        // Make a new client
        ViconDataStreamSDK.DotNET.Client MyClient = new ViconDataStreamSDK.DotNET.Client();

        // Set the streaming mode
        MyClient.SetStreamMode( ViconDataStreamSDK.DotNET.StreamMode.ClientPull );
        //MyClient.SetStreamMode( ViconDataStreamSDK.DotNET.StreamMode.ClientPullPreFetch );
        //MyClient.SetStreamMode( ViconDataStreamSDK.DotNET.StreamMode.ServerPush );

        return new {
            /*connect = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {
                    string HostName = (string)i;

                    // Connect to a server
                    //Console.Write( "Connecting to {0} ...", HostName);
                    while( !MyClient.IsConnected().Connected )
                    {
                      // Direct connection
                      MyClient.Connect( HostName );

                      // Sleep a bit
                      System.Threading.Thread.Sleep( 200 );
                      //Console.Write( "." );
                    }
                    //Console.WriteLine();
                    //Console.WriteLine("Connected");
                    return true;
                }
            ),*/
            connect = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {
                    return await Task.Run<object>(async () => {
                        string HostName = (string)i;

                        // Connect to a server
                        //Console.Write( "Connecting to {0} ...", HostName);
                        while( !MyClient.IsConnected().Connected )
                        {
                          // Direct connection
                          MyClient.Connect( HostName );

                          // Sleep a bit
                          System.Threading.Thread.Sleep( 200 );
                          //Console.Write( "." );
                        }
                        //Console.WriteLine();
                        //Console.WriteLine("Connected");
                        return true;
                    });
                }
            ),
            enableMarkerData = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {
                    //MyClient.EnableSegmentData();
                    //MyClient.EnableMarkerData();
                    //MyClient.EnableUnlabeledMarkerData();
                    //MyClient.EnableSegmentData();
                    MyClient.EnableMarkerData();
                    //MyClient.EnableUnlabeledMarkerData();
                    //MyClient.EnableDeviceData();
                    //MyClient.EnableCentroidData();
                    Output_IsMarkerDataEnabled Output = MyClient.IsMarkerDataEnabled();
                    if (Output.Enabled) {
                        //Console.WriteLine("Marker data enabled");
                        return true;
                    } else {
                        //Console.WriteLine("Marker data not enabled");
                        return false;
                    }
                }
            ),
            getFrameWhenAvailable = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {
                    //Console.Write( "Waiting for new frame ..." );
                    while( MyClient.GetFrame().Result != ViconDataStreamSDK.DotNET.Result.Success )
                    {
                      //System.Threading.Thread.Sleep(200);
                      //Console.Write( "." );
                    }
                    //Console.WriteLine();
                    //Console.WriteLine("New frame arrived");
                    return null;
                }
            ),
            getFrameIfAvailable = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {
                    // https://stackoverflow.com/questions/13513650/how-to-set-timeout-for-a-line-of-c-sharp-code
                    Output_GetFrame Output;
                    var task = Task.Run(() => MyClient.GetFrame());
                    if (!task.Wait(TimeSpan.FromMilliseconds(50)))
                      return false;
                    else
                      Output = task.Result;
                    if( Output.Result == ViconDataStreamSDK.DotNET.Result.Success )
                    {
                        return true;
                    }
                    return false;
                }
            ),
            getFrameNumber = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {
                    // Get the frame number
                    Output_GetFrameNumber Output = MyClient.GetFrameNumber();
                    uint FrameNumber = Output.FrameNumber;
                    //Console.WriteLine( "Frame Number: {0}", FrameNumber );
                    return FrameNumber;
                }
            ),
            getSubjectNames = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {
                    // Count the number of subjects
                    uint SubjectCount = MyClient.GetSubjectCount().SubjectCount;
                    Console.WriteLine( "Subjects ({0}):", SubjectCount );
                    for( uint SubjectIndex = 0 ; SubjectIndex < SubjectCount ; ++SubjectIndex )
                    {
                        Console.WriteLine( "  Subject #{0}", SubjectIndex );

                        // Get the subject name
                        string SubjectName = MyClient.GetSubjectName( SubjectIndex ).SubjectName;
                        Console.WriteLine( "    Name: {0}", SubjectName );
                    }
                    return null;
                }
            ),
            getMarkerGlobalTranslation = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {

                    string SubjectName = (string)i.subject;
                    string MarkerName = (string)i.marker;

                    //uint MarkerCount = MyClient.GetMarkerCount( SubjectName ).MarkerCount;
                    //Console.WriteLine( "    Markers ({0}):", MarkerCount );
                    //for( uint MarkerIndex = 0 ; MarkerIndex < MarkerCount ; ++MarkerIndex )
                    //{
                      // Get the marker name
                      //string MarkerName2 = MyClient.GetMarkerName( SubjectName, MarkerIndex ).MarkerName;
                      //Console.WriteLine(MarkerName2);
                    //}

                    Output_GetMarkerGlobalTranslation Output = MyClient.GetMarkerGlobalTranslation( SubjectName, MarkerName );
                    //Console.WriteLine( "success: {0}", Output.Result==ViconDataStreamSDK.DotNET.Result.Success);
                    //Console.WriteLine( "      Marker #{0}: {1} ({2}, {3}, {4}) {5}",
                    //                   0,
                    //                   MarkerName,
                    //                   Output.Translation[ 0 ],
                    //                   Output.Translation[ 1 ],
                    //                   Output.Translation[ 2 ],
                    //                   Output.Occluded );
                    return new {
                        label = MarkerName,
                        x = Output.Translation[ 0 ],
                        y = Output.Translation[ 1 ],
                        z = Output.Translation[ 2 ],
                        occluded = Output.Occluded,
                    };
                }
            ),
            getAllMarkersGlobalTranslation = (Func<object,Task<object>>)(
                async (dynamic i) =>
                {

                    List<dynamic> list = new List<dynamic>();

                    uint SubjectCount = MyClient.GetSubjectCount().SubjectCount;
                    //Console.WriteLine( "Subjects ({0}):", SubjectCount );
                    for( uint SubjectIndex = 0 ; SubjectIndex < SubjectCount ; ++SubjectIndex )
                    {
                        //Console.WriteLine( "  Subject #{0}", SubjectIndex );

                        // Get the subject name
                        string SubjectName = MyClient.GetSubjectName( SubjectIndex ).SubjectName;

                        // Count the number of markers
                        uint MarkerCount = MyClient.GetMarkerCount( SubjectName ).MarkerCount;
                        //Console.WriteLine( "    Markers ({0}):", MarkerCount );
                        for( uint MarkerIndex = 0 ; MarkerIndex < MarkerCount ; ++MarkerIndex )
                        {
                            // Get the marker name
                            string MarkerName = MyClient.GetMarkerName( SubjectName, MarkerIndex ).MarkerName;

                            // Get the marker parent
                            //string MarkerParentName = MyClient.GetMarkerParentName(SubjectName, MarkerName).SegmentName;

                            // Get the global marker translation
                            Output_GetMarkerGlobalTranslation Output =
                              MyClient.GetMarkerGlobalTranslation( SubjectName, MarkerName );

                            dynamic MarkerData = new {
                                label = MarkerName,
                                x = Output.Translation[ 0 ],
                                y = Output.Translation[ 1 ],
                                z = Output.Translation[ 2 ],
                                occluded = Output.Occluded,
                            };

                            list.Add(MarkerData);

                        }
                    }
                    dynamic [] terms = list.ToArray();
                    return terms;
                }
            ),
        };
    }
}
