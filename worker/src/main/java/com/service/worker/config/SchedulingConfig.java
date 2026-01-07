package com.service.worker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Configuration class for scheduling tasks.
 * This allows customization of the thread pool used for scheduled tasks.
 * 
 * Các setting có thể cấu hình:
 * - setScheduler(): Set scheduler cho scheduled tasks
 * - setTaskScheduler(): Set TaskScheduler với nhiều options hơn
 * - setErrorHandler(): Set error handler cho tasks
 * - setSchedulerTasks(): Set danh sách tasks tùy chỉnh
 */
@Configuration
public class SchedulingConfig implements SchedulingConfigurer {

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        // CÁCH 1: Dùng Executors (đơn giản, ít options)
        // taskRegistrar.setScheduler(Executors.newScheduledThreadPool(5));

        // CÁCH 2: Dùng ThreadPoolTaskScheduler (nhiều options hơn) - KHUYẾN NGHỊ
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        
        // Pool size: Số threads tối đa
        // Khuyến nghị: CPU cores × 2 đến 4
        // Ví dụ: 4 cores → 8-16 threads, 8 cores → 16-32 threads
        taskScheduler.setPoolSize(5);
        
        // Thread name prefix: Để dễ debug trong logs
        taskScheduler.setThreadNamePrefix("scheduled-task-");
        
        // Wait for tasks to complete on shutdown
        // true: Đợi tasks đang chạy xong mới shutdown
        // false: Force shutdown ngay
        // Liên quan đến setting bên dưới 
        taskScheduler.setWaitForTasksToCompleteOnShutdown(true);
        
        // Thời gian đợi tối đa khi shutdown Spring boot app (Ctrl + C, kill, restart) 
        // (milliseconds)
        // Khi các scheduled Tasks có thể đang chạy
        taskScheduler.setAwaitTerminationSeconds(60*1000);
        
        // Rejected execution handler: Xử lý khi thread pool đầy
        // Có thể set: CallerRunsPolicy, AbortPolicy, DiscardPolicy, DiscardOldestPolicy
        // taskScheduler.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // Initialize scheduler
        taskScheduler.initialize();
        
        // Set vào registrar
        taskRegistrar.setTaskScheduler(taskScheduler);
        
        // CÁC SETTING KHÁC:
        
        // Set error handler cho tất cả scheduled tasks
        // taskRegistrar.setErrorHandler(new CustomErrorHandler());
        
        // Set cron tasks tùy chỉnh (nếu cần)
        // taskRegistrar.setCronTasks(...);
        
        // Set fixed rate tasks tùy chỉnh (nếu cần)
        // taskRegistrar.setFixedRateTasks(...);
        
        // Set fixed delay tasks tùy chỉnh (nếu cần)
        // taskRegistrar.setFixedDelayTasks(...);
    }
}

