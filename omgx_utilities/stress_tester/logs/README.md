Various stress-tester logs will be written here. They are opened in append mode
therefore old data must be deleted manually.

 op.log - tracks progress of individual operations
   START - timestamps the start of the operation
   WATCH - Provides transaction hash etc. once transaction has been submitted
   DONE - Provides timing and final result once recept and event (if applicable) has been received

 watcher-L<n>.log - Inspects new blocks on the two chains
 
 worker-<n>.log - More info about operations submitted by each worker thread
 
 mainloop.log - Overall progress and statistics
 
 accounts-<target>.log - Addresses and keys for each child process. Can be used
   later to recover balances which were not refunded during a clean shutdown.

 
 
